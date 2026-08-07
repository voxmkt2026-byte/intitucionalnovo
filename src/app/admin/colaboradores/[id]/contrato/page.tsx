import { redirect, notFound } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { neon } from "@neondatabase/serverless";
import { decryptField } from "@/lib/crypto";

export const metadata = {
  title: "Ficha de Cadastro de Colaborador | Titanium Admin",
  robots: { index: false, follow: false },
};

const DATABASE_URL = process.env.DATABASE_URL || "";

async function getColaboradorData(id: number) {
  if (!DATABASE_URL) return null;
  const sql = neon(DATABASE_URL);
  
  try {
    const result = await sql`
      SELECT id, nome, documento_cpf_cnpj, email, telefone, cidade, redes_sociais, chave_pix,
             status_onboarding, codigo_ref, vende_consorcio, aceite_playbook, ip_assinatura, 
             assinado_em, criado_em, cpf, cnpj, data_nascimento, rg, endereco_completo,
             banco, tipo_conta, agencia, conta, operacao, titular_nome,
             principal_produto, trabalha_carta_contemplada, principal_publico,
             quantidade_indicacoes, quer_atuar_como, aceita_receber_contatos, quantidade_colaboradores
      FROM afiliados
      WHERE id = ${id}
      LIMIT 1
    `;
    const partner: any = result[0];
    if (!partner) return null;

    return {
      ...partner,
      cpf: decryptField(partner.cpf),
      cnpj: decryptField(partner.cnpj),
      rg: decryptField(partner.rg),
      agencia: decryptField(partner.agencia),
      conta: decryptField(partner.conta),
      chave_pix: decryptField(partner.chave_pix),
    } as any;
  } catch (err) {
    console.error("Erro ao carregar colaborador para contrato:", err);
    return null;
  }
}

export default async function ColaboradorContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) redirect("/admin/login");

  const { id } = await params;
  const partner = await getColaboradorData(parseInt(id, 10));

  if (!partner) {
    notFound();
  }

  const formattedDate = partner.assinado_em
    ? new Date(partner.assinado_em).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  return (
    <div className="bg-white text-slate-900 min-h-screen p-8 sm:p-12 font-sans selection:bg-emerald-500 selection:text-white print:p-0 print:text-black">
      {/* Print Trigger Instruction (Visible only on screen) */}
      <div className="max-w-4xl mx-auto mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex justify-between items-center print:hidden">
        <span>Ficha de cadastro de 2 páginas gerada automaticamente. Pressione <strong>Ctrl + P</strong> (ou Cmd + P) para Salvar como PDF.</span>
        <button
          id="print-btn"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
          style={{ border: "none" }}
        >
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>

      {/* PAGE 1: DADOS CADASTRAIS E BANCÁRIOS */}
      <div className="max-w-4xl mx-auto border border-gray-300 p-8 rounded-lg print:border-none print:p-0 mb-8">
        {/* Logo & Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wider text-slate-900 uppercase">TITANIUM CONSULTORIA</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1 uppercase">Formulário de Cadastro de Colaborador</p>
          </div>
          {/* Logo representation */}
          <div className="w-12 h-12 bg-emerald-700 text-white font-extrabold text-2xl flex items-center justify-center rounded-lg">
            T
          </div>
        </div>

        {/* Section 1: Dados Cadastrais */}
        <div className="space-y-4 mb-8">
          <h2 className="text-sm font-bold text-slate-900 uppercase border-b border-gray-300 pb-1">1. Dados Cadastrais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="col-span-1 md:col-span-2 border-b border-gray-200 pb-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Nome completo / Razão social</span>
              <span className="font-semibold text-sm">{partner.nome}</span>
            </div>
            
            <div className="border-b border-gray-200 pb-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">CPF</span>
              <span className="font-semibold text-sm">{partner.cpf || partner.documento_cpf_cnpj}</span>
            </div>
            
            <div className="border-b border-gray-200 pb-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">CNPJ (se aplicável)</span>
              <span className="font-semibold text-sm">{partner.cnpj || "—"}</span>
            </div>

            <div className="border-b border-gray-200 pb-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Data de nascimento</span>
              <span className="font-semibold text-sm">{partner.data_nascimento || "—"}</span>
            </div>
            
            <div className="border-b border-gray-200 pb-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">RG</span>
              <span className="font-semibold text-sm">{partner.rg || "—"}</span>
            </div>

            <div className="col-span-1 md:col-span-2 border-b border-gray-200 pb-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Endereço completo (rua, número, bairro, cidade, UF, CEP)</span>
              <span className="font-semibold text-sm">{partner.endereco_completo || "—"}</span>
            </div>

            <div className="border-b border-gray-200 pb-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Telefone / WhatsApp</span>
              <span className="font-semibold text-sm">{partner.telefone}</span>
            </div>
            
            <div className="border-b border-gray-200 pb-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">E-mail</span>
              <span className="font-semibold text-sm">{partner.email}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Dados Bancários */}
        <div className="space-y-4 mb-8">
          <h2 className="text-sm font-bold text-slate-900 uppercase border-b border-gray-300 pb-1">2. Dados Bancários (para pagamento de comissão)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border-b border-gray-200 pb-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Banco</span>
              <span className="font-semibold text-sm">{partner.banco || "—"}</span>
            </div>
            
            <div className="border-b border-gray-200 pb-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Tipo de conta</span>
              <span className="font-semibold text-sm">{partner.tipo_conta || "—"}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2 border-b border-gray-200 pb-2">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Agência</span>
                <span className="font-semibold text-sm">{partner.agencia || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Conta</span>
                <span className="font-semibold text-sm">{partner.conta || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Operação (se houver)</span>
                <span className="font-semibold text-sm">{partner.operacao || "—"}</span>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Chave PIX</span>
              <span className="font-semibold text-sm">{partner.chave_pix}</span>
            </div>
            
            <div className="border-b border-gray-200 pb-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Nome do titular da conta (se diferente)</span>
              <span className="font-semibold text-sm">{partner.titular_nome || partner.nome}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Declaração */}
        <div className="space-y-4 mb-8">
          <h2 className="text-sm font-bold text-slate-900 uppercase border-b border-gray-300 pb-1">3. Declaração</h2>
          <p className="text-xs text-gray-700 leading-relaxed font-light">
            Declaro que as informações fornecidas neste formulário são verdadeiras e autorizo a Titanium Consultoria a utilizá-las para fins de cadastro, comunicação, relacionamento e pagamento de comissões referentes às parcerias firmadas.
          </p>

          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="border-t border-gray-400 pt-3 text-center">
              <div className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wide mb-1">
                (Documento assinado digitalmente)
              </div>
              <div className="text-[9px] text-gray-500 font-mono">
                IP: {partner.ip_assinatura}
              </div>
              <div className="text-[9px] text-gray-500 font-mono">
                Ref: {partner.codigo_ref}
              </div>
              <div className="text-xs font-semibold text-slate-900 mt-2">{partner.nome}</div>
              <span className="text-[9px] text-gray-500 uppercase">Assinatura do colaborador</span>
            </div>
            <div className="border-t border-gray-400 pt-3 text-center flex flex-col justify-end">
              <div className="text-xs font-semibold text-slate-900">{formattedDate}</div>
              <span className="text-[9px] text-gray-500 uppercase">Data</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-gray-400 border-t border-gray-200 pt-4">
          Titanium Consultoria • Ficha Cadastral de Colaborador • Página 1 de 2
        </div>
      </div>

      {/* PAGE 2: INFORMAÇÕES COMERCIAIS COMPLEMENTARES */}
      <div className="max-w-4xl mx-auto border border-gray-300 p-8 rounded-lg print:border-none print:p-0 print:break-before-page">
        {/* Logo & Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wider text-slate-900 uppercase">TITANIUM CONSULTORIA</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1 uppercase">Informações comerciais complementares</p>
          </div>
          {/* Logo representation */}
          <div className="w-12 h-12 bg-emerald-700 text-white font-extrabold text-2xl flex items-center justify-center rounded-lg">
            T
          </div>
        </div>

        {/* Section 4: Informações Comerciais */}
        <div className="space-y-6 mb-12">
          <h2 className="text-sm font-bold text-slate-900 uppercase border-b border-gray-300 pb-1">4. Informações Comerciais</h2>
          <p className="text-[10px] text-gray-500 font-light">Campos de lista permitem seleção pelo menu e edição manual quando necessário.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
            
            {/* Box Você trabalha com consórcio? */}
            <div className="border border-gray-300 rounded-lg p-3 relative bg-gray-50/50">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Você trabalha com consórcio?</span>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">{partner.vende_consorcio ? "Sim" : "Não"}</span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>
            </div>

            {/* Box Principal produto atual */}
            <div className="border border-gray-300 rounded-lg p-3 relative bg-gray-50/50">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Principal produto atual</span>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">{partner.principal_produto || "—"}</span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>
            </div>

            {/* Box Já trabalha com carta contemplada? */}
            <div className="border border-gray-300 rounded-lg p-3 relative bg-gray-50/50">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Já trabalha com carta contemplada?</span>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">{partner.trabalha_carta_contemplada || "—"}</span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>
            </div>

            {/* Box Principal público */}
            <div className="border border-gray-300 rounded-lg p-3 relative bg-gray-50/50">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Principal público</span>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">{partner.principal_publico || "—"}</span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>
            </div>

            {/* Box Quantidade média de indicações / mês */}
            <div className="border border-gray-300 rounded-lg p-3 relative bg-gray-50/50">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Quantidade média de indicações / mês</span>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">{partner.quantidade_indicacoes || "—"}</span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>
            </div>

            {/* Box Quer atuar como */}
            <div className="border border-gray-300 rounded-lg p-3 relative bg-gray-50/50">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Quer atuar como</span>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">{partner.quer_atuar_como || "—"}</span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>
            </div>

            {/* Box Quantidade de colaboradores */}
            <div className="border border-gray-300 rounded-lg p-3 relative bg-gray-50/50 col-span-1 md:col-span-2">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Quantos colaboradores a sua operação tem?</span>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">{partner.quantidade_colaboradores || "—"}</span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>
            </div>

            {/* Box Instagram / LinkedIn / site */}
            <div className="border border-gray-300 rounded-lg p-3 relative bg-gray-50/50 col-span-1 md:col-span-2">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Instagram / LinkedIn / site</span>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">{partner.redes_sociais || "—"}</span>
              </div>
            </div>
          </div>

          {/* Checkbox aceita_receber_contatos */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50/30 text-xs mt-6 flex items-start gap-3">
            <div className="w-5 h-5 border border-slate-900 flex items-center justify-center font-bold text-sm select-none shrink-0 mt-0.5 bg-white">
              {partner.aceita_receber_contatos ? "X" : ""}
            </div>
            <div>
              <span className="font-bold text-slate-800">Aceita receber contato e materiais da área de colaboradores?</span>
              <p className="text-[10px] text-gray-500 mt-0.5">Opção marcada pelo colaborador no formulário autorizando o recebimento de materiais e comunicados oficiais.</p>
            </div>
          </div>
        </div>

        {/* Declaration and Signature of Page 2 */}
        <div className="space-y-4 mb-12">
          <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-gray-300 pb-1">Assinatura Digital de Validação</h3>
          <div className="grid grid-cols-2 gap-8 pt-6">
            <div className="border-t border-gray-400 pt-3 text-center">
              <div className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wide mb-1">
                (Documento assinado digitalmente)
              </div>
              <div className="text-[9px] text-gray-500 font-mono">
                IP: {partner.ip_assinatura}
              </div>
              <div className="text-[9px] text-gray-500 font-mono">
                Ref: {partner.codigo_ref}
              </div>
              <div className="text-xs font-semibold text-slate-900 mt-2">{partner.nome}</div>
              <span className="text-[9px] text-gray-500 uppercase">Assinatura do colaborador</span>
            </div>
            <div className="border-t border-gray-400 pt-3 text-center flex flex-col justify-end">
              <div className="text-xs font-semibold text-slate-900">{formattedDate}</div>
              <span className="text-[9px] text-gray-500 uppercase">Data</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-gray-400 border-t border-gray-200 pt-4">
          Titanium Consultoria • Informações Comerciais Complementares • Página 2 de 2
        </div>
      </div>
      
      {/* Auto-print logic wrapper for print buttons */}
      <script dangerouslySetInnerHTML={{
        __html: `
          const btn = document.getElementById('print-btn');
          if (btn) {
            btn.addEventListener('click', () => {
              window.print();
            });
          }
        `
      }} />
    </div>
  );
}
