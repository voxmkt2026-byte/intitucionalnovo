import { NextResponse } from "next/server";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { encryptField } from "@/lib/crypto";

const cadastroSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório").max(150),
  documento_cpf_cnpj: z.string().min(11, "Documento inválido").max(18),
  cpf: z.string().min(11, "CPF inválido").max(14),
  cnpj: z.string().max(18).default(""),
  data_nascimento: z.string().min(6, "Data de nascimento inválida").max(15),
  rg: z.string().min(4, "RG inválido").max(20),
  endereco_completo: z.string().min(5, "Endereço completo é obrigatório").max(300),
  email: z.string().email("E-mail inválido").max(100),
  telefone: z.string().min(8, "Telefone inválido").max(20),
  cidade: z.string().min(2, "Cidade é obrigatória").max(100),
  redes_sociais: z.string().max(200).default(""),
  banco: z.string().min(2, "Banco é obrigatório").max(100),
  tipo_conta: z.string().min(2, "Tipo de conta é obrigatório").max(50),
  agencia: z.string().min(2, "Agência é obrigatória").max(20),
  conta: z.string().min(2, "Conta é obrigatória").max(30),
  operacao: z.string().max(20).default(""),
  chave_pix: z.string().min(4, "Chave Pix é obrigatória").max(150),
  titular_nome: z.string().max(150).default(""),
  vende_consorcio: z.boolean().default(false),
  experiencia_administradoras: z.string().max(500).default(""),
  experiencia_volume: z.string().max(100).default(""),
  experiencia_segmentos: z.string().max(500).default(""),
  base_tamanho: z.string().max(100).default(""),
  base_canais: z.string().max(500).default(""),
  base_ticket_medio: z.string().max(100).default(""),
  principal_produto: z.string().max(150).default(""),
  trabalha_carta_contemplada: z.string().max(50).default(""),
  principal_publico: z.string().max(150).default(""),
  quantidade_indicacoes: z.string().max(100).default(""),
  quer_atuar_como: z.string().max(150).default(""),
  aceita_receber_contatos: z.boolean().default(false),
  quantidade_colaboradores: z.string().max(100).default(""),
  aceite_playbook: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar o playbook de compliance",
  }),
});

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^\w\s-]/g, "") // remove caracteres especiais
    .replace(/[\s_]+/g, "-") // substitui espaços por hífen
    .replace(/^-+|-+$/g, ""); // remove hífens extras
}

// CPF validation logic
function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false; // repetição

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10))) return false;

  return true;
}

// CNPJ validation logic
function isValidCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, "");
  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false; // repetição

  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  const digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

export async function POST(req: Request) {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      return NextResponse.json(
        { error: "Database configuration missing" },
        { status: 500 }
      );
    }

    const sql = neon(DATABASE_URL);

    // 0. Rate limiting por IP para conter bots/DoS na rota pública de cadastro (Limite estrito: 3 por hora)
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(sql, `colaboradores-cadastro:${clientIp}`, 3, 60 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas de cadastro a partir deste IP. Tente novamente em uma hora." },
        { status: 429 }
      );
    }

    const rawBody = await req.json();

    // 1. Honeypot check: Se houver qualquer valor no campo honeypot invisível, rejeitamos silenciosamente com sucesso fake para enganar o robô
    if (rawBody.website_honeypot) {
      console.warn(`[Honeypot Triggered] IP: ${clientIp} tentou enviar formulário com honeypot ativo.`);
      return NextResponse.json(
        {
          success: true,
          message: "Cadastro realizado com sucesso! Aguarde a aprovação do gestor.",
          parceiro: { id: 999999, nome: sanitizeText(rawBody.nome || ""), codigo_ref: "colaborador-temp", status_onboarding: "Pendente" },
        },
        { status: 201 }
      );
    }

    const parsedData = cadastroSchema.parse(rawBody);

    // 2. Validação matemática do CPF/CNPJ para barrar geradores aleatórios
    const cleanCpf = parsedData.cpf.replace(/\D/g, "");
    const cleanCnpj = parsedData.cnpj.replace(/\D/g, "");

    if (cleanCnpj) {
      if (!isValidCNPJ(cleanCnpj)) {
        return NextResponse.json({ error: "CNPJ inválido de acordo com a validação do dígito verificador." }, { status: 400 });
      }
    } else {
      if (!isValidCPF(cleanCpf)) {
        return NextResponse.json({ error: "CPF inválido de acordo com a validação do dígito verificador." }, { status: 400 });
      }
    }

    // Sanitizar campos de texto livre para evitar XSS armazenado
    const validatedData = {
      ...parsedData,
      nome: sanitizeText(parsedData.nome),
      endereco_completo: sanitizeText(parsedData.endereco_completo),
      redes_sociais: sanitizeText(parsedData.redes_sociais),
      titular_nome: sanitizeText(parsedData.titular_nome),
      cidade: sanitizeText(parsedData.cidade),
      principal_produto: sanitizeText(parsedData.principal_produto),
      trabalha_carta_contemplada: sanitizeText(parsedData.trabalha_carta_contemplada),
      principal_publico: sanitizeText(parsedData.principal_publico),
      quantidade_indicacoes: sanitizeText(parsedData.quantidade_indicacoes),
      quer_atuar_como: sanitizeText(parsedData.quer_atuar_como),
      quantidade_colaboradores: sanitizeText(parsedData.quantidade_colaboradores),
      experiencia_administradoras: sanitizeText(parsedData.experiencia_administradoras),
      experiencia_segmentos: sanitizeText(parsedData.experiencia_segmentos),
      base_canais: sanitizeText(parsedData.base_canais),
    };

    // 3. Verificar se documento ou email já estão cadastrados
    const existingUser = await sql`
      SELECT id FROM afiliados 
      WHERE documento_cpf_cnpj = ${validatedData.documento_cpf_cnpj} 
         OR email = ${validatedData.email} 
      LIMIT 1
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Já existe um colaborador cadastrado com este E-mail ou CPF/CNPJ." },
        { status: 400 }
      );
    }

    // 4. Gerar codigo_ref único
    let baseRef = slugify(validatedData.nome.split(" ")[0]);
    if (!baseRef) baseRef = "colaborador";

    let codigoRef = baseRef;
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
      const checkRef = await sql`
        SELECT id FROM afiliados WHERE codigo_ref = ${codigoRef} LIMIT 1
      `;
      if (checkRef.length === 0) {
        isUnique = true;
      } else {
        codigoRef = `${baseRef}${counter}`;
        counter++;
      }
    }

    // 5. Inserir colaborador no banco de dados
    const result = await sql`
      INSERT INTO afiliados (
        nome, documento_cpf_cnpj, email, telefone, cidade, redes_sociais, chave_pix,
        cpf, cnpj, data_nascimento, rg, endereco_completo, banco, tipo_conta,
        agencia, conta, operacao, titular_nome,
        principal_produto, trabalha_carta_contemplada, principal_publico,
        quantidade_indicacoes, quer_atuar_como, aceita_receber_contatos, quantidade_colaboradores,
        status_onboarding, codigo_ref, vende_consorcio, experiencia_administradoras,
        experiencia_volume, experiencia_segmentos, base_tamanho, base_canais,
        base_ticket_medio, aceite_playbook, ip_assinatura, assinado_em
      ) VALUES (
        ${validatedData.nome},
        ${validatedData.documento_cpf_cnpj},
        ${validatedData.email},
        ${validatedData.telefone},
        ${validatedData.cidade},
        ${validatedData.redes_sociais},
        ${encryptField(validatedData.chave_pix)},
        ${encryptField(validatedData.cpf)},
        ${encryptField(validatedData.cnpj)},
        ${validatedData.data_nascimento},
        ${encryptField(validatedData.rg)},
        ${validatedData.endereco_completo},
        ${validatedData.banco},
        ${validatedData.tipo_conta},
        ${encryptField(validatedData.agencia)},
        ${encryptField(validatedData.conta)},
        ${validatedData.operacao},
        ${validatedData.titular_nome},
        ${validatedData.principal_produto},
        ${validatedData.trabalha_carta_contemplada},
        ${validatedData.principal_publico},
        ${validatedData.quantidade_indicacoes},
        ${validatedData.quer_atuar_como},
        ${validatedData.aceita_receber_contatos},
        ${validatedData.quantidade_colaboradores},
        'Pendente',
        ${codigoRef},
        ${validatedData.vende_consorcio},
        ${validatedData.experiencia_administradoras},
        ${validatedData.experiencia_volume},
        ${validatedData.experiencia_segmentos},
        ${validatedData.base_tamanho},
        ${validatedData.base_canais},
        ${validatedData.base_ticket_medio},
        ${validatedData.aceite_playbook},
        ${clientIp},
        NOW()
      ) RETURNING id, nome, codigo_ref, status_onboarding
    `;

    return NextResponse.json(
      {
        success: true,
        message: "Cadastro realizado com sucesso! Aguarde a aprovação do gestor.",
        parceiro: result[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro no cadastro de colaborador:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor." },
      { status: 500 }
    );
  }
}
