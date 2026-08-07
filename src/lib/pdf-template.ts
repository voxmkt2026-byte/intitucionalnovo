interface AfiliadoContrato {
  nome: string;
  cpf: string;
  cnpj: string;
  data_nascimento: string;
  rg: string;
  endereco_completo: string;
  telefone: string;
  email: string;
  banco: string;
  tipo_conta: string;
  agencia: string;
  conta: string;
  operacao: string;
  chave_pix: string;
  titular_nome: string;
  vende_consorcio: boolean;
  principal_produto: string;
  trabalha_carta_contemplada: string;
  principal_publico: string;
  quantidade_indicacoes: string;
  quer_atuar_como: string;
  quantidade_colaboradores: string;
  redes_sociais: string;
  aceita_receber_contatos: boolean;
  ip_assinatura: string;
  codigo_ref: string;
  assinado_em: string | null;
  documento_cpf_cnpj: string;
}

function esc(value: unknown): string {
  const str = value === null || value === undefined || value === "" ? "—" : String(value);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function field(label: string, value: unknown): string {
  return `
    <div class="field">
      <span class="label">${esc(label)}</span>
      <span class="value">${esc(value)}</span>
    </div>`;
}

/** Renders a standalone, print-ready HTML document (no external assets) for PDF generation via headless Chromium. */
export function generateContractHtml(partner: AfiliadoContrato): string {
  const formattedDate = partner.assinado_em
    ? new Date(partner.assinado_em).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Ficha de Cadastro - ${esc(partner.nome)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 32px; }
  .page { border: 1px solid #d1d5db; border-radius: 8px; padding: 32px; margin-bottom: 32px; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 20px; letter-spacing: 1px; margin: 0; text-transform: uppercase; }
  .header p { font-size: 12px; color: #64748b; margin: 4px 0 0; text-transform: uppercase; font-weight: 600; }
  .logo { width: 44px; height: 44px; background: #047857; color: #fff; font-weight: 800; font-size: 22px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
  h2.section { font-size: 12px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; margin: 24px 0 12px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
  .field { border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
  .field.full { grid-column: 1 / -1; }
  .label { display: block; font-size: 9px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; }
  .value { font-size: 13px; font-weight: 600; }
  .declaration { font-size: 11px; color: #374151; line-height: 1.6; }
  .sign-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding-top: 24px; }
  .sign-box { border-top: 1px solid #9ca3af; padding-top: 10px; text-align: center; }
  .sign-box .tag { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #047857; }
  .sign-box .mono { font-size: 8px; color: #6b7280; font-family: monospace; }
  .footer { text-align: center; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 24px; }
  .checkbox { display: flex; gap: 10px; border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; margin-top: 16px; font-size: 11px; }
  .checkbox .box { width: 16px; height: 16px; border: 1px solid #0f172a; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; flex-shrink: 0; }
</style>
</head>
<body>

  <div class="page">
    <div class="header">
      <div>
        <h1>Titanium Consultoria</h1>
        <p>Formulário de Cadastro de Colaborador</p>
      </div>
      <div class="logo">T</div>
    </div>

    <h2 class="section">1. Dados Cadastrais</h2>
    <div class="grid">
      <div class="field full">${field("Nome completo / Razão social", partner.nome)}</div>
      ${field("CPF", partner.cpf || partner.documento_cpf_cnpj)}
      ${field("CNPJ (se aplicável)", partner.cnpj)}
      ${field("Data de nascimento", partner.data_nascimento)}
      ${field("RG", partner.rg)}
      <div class="field full">${field("Endereço completo", partner.endereco_completo)}</div>
      ${field("Telefone / WhatsApp", partner.telefone)}
      ${field("E-mail", partner.email)}
    </div>

    <h2 class="section">2. Dados Bancários (para pagamento de comissão)</h2>
    <div class="grid">
      ${field("Banco", partner.banco)}
      ${field("Tipo de conta", partner.tipo_conta)}
      ${field("Agência", partner.agencia)}
      ${field("Conta", partner.conta)}
      ${field("Operação (se houver)", partner.operacao)}
      ${field("Chave PIX", partner.chave_pix)}
      ${field("Nome do titular da conta", partner.titular_nome || partner.nome)}
    </div>

    <h2 class="section">3. Declaração</h2>
    <p class="declaration">Declaro que as informações fornecidas neste formulário são verdadeiras e autorizo a Titanium Consultoria a utilizá-las para fins de cadastro, comunicação, relacionamento e pagamento de comissões referentes às parcerias firmadas.</p>

    <div class="sign-grid">
      <div class="sign-box">
        <div class="tag">(Documento assinado digitalmente)</div>
        <div class="mono">IP: ${esc(partner.ip_assinatura)}</div>
        <div class="mono">Ref: ${esc(partner.codigo_ref)}</div>
        <div class="value" style="margin-top:8px;">${esc(partner.nome)}</div>
        <span style="font-size:9px;color:#6b7280;text-transform:uppercase;">Assinatura do colaborador</span>
      </div>
      <div class="sign-box">
        <div class="value">${esc(formattedDate)}</div>
        <span style="font-size:9px;color:#6b7280;text-transform:uppercase;">Data</span>
      </div>
    </div>

    <div class="footer">Titanium Consultoria • Ficha Cadastral de Colaborador • Página 1 de 2</div>
  </div>

  <div class="page">
    <div class="header">
      <div>
        <h1>Titanium Consultoria</h1>
        <p>Informações comerciais complementares</p>
      </div>
      <div class="logo">T</div>
    </div>

    <h2 class="section">4. Informações Comerciais</h2>
    <div class="grid">
      ${field("Você trabalha com consórcio?", partner.vende_consorcio ? "Sim" : "Não")}
      ${field("Principal produto atual", partner.principal_produto)}
      ${field("Já trabalha com carta contemplada?", partner.trabalha_carta_contemplada)}
      ${field("Principal público", partner.principal_publico)}
      ${field("Quantidade média de indicações / mês", partner.quantidade_indicacoes)}
      ${field("Quer atuar como", partner.quer_atuar_como)}
      <div class="field full">${field("Quantos colaboradores a sua operação tem?", partner.quantidade_colaboradores)}</div>
      <div class="field full">${field("Instagram / LinkedIn / site", partner.redes_sociais)}</div>
    </div>

    <div class="checkbox">
      <div class="box">${partner.aceita_receber_contatos ? "X" : ""}</div>
      <div>
        <strong>Aceita receber contato e materiais da área de colaboradores?</strong>
        <div style="font-size:10px;color:#6b7280;margin-top:2px;">Opção marcada pelo colaborador no formulário autorizando o recebimento de materiais e comunicados oficiais.</div>
      </div>
    </div>

    <h2 class="section">Assinatura Digital de Validação</h2>
    <div class="sign-grid">
      <div class="sign-box">
        <div class="tag">(Documento assinado digitalmente)</div>
        <div class="mono">IP: ${esc(partner.ip_assinatura)}</div>
        <div class="mono">Ref: ${esc(partner.codigo_ref)}</div>
        <div class="value" style="margin-top:8px;">${esc(partner.nome)}</div>
        <span style="font-size:9px;color:#6b7280;text-transform:uppercase;">Assinatura do colaborador</span>
      </div>
      <div class="sign-box">
        <div class="value">${esc(formattedDate)}</div>
        <span style="font-size:9px;color:#6b7280;text-transform:uppercase;">Data</span>
      </div>
    </div>

    <div class="footer">Titanium Consultoria • Informações Comerciais Complementares • Página 2 de 2</div>
  </div>

</body>
</html>`;
}
