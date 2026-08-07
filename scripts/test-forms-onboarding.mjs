const TARGET_URL = "https://intitucionalnovo.vercel.app/api/afiliados/cadastro";

async function runE2ETest() {
  console.log("🚀 Iniciando Teste E2E do Formulário de Onboarding...");
  console.log(`🔗 Destino: ${TARGET_URL}`);

  // Dados fictícios simulando o preenchimento fluido pelo usuário
  const payload = {
    nome: "Teste Automatizado E2E",
    documento_cpf_cnpj: "999.999.999-99",
    cpf: "999.999.999-99",
    cnpj: "",
    data_nascimento: "01/01/1990",
    rg: "12.345.678-9",
    endereco_completo: "Rua Teste das Oliveiras, 123, Centro, São Paulo - SP, 01001-000",
    email: "test-e2e-onboarding@titanium.com.br",
    telefone: "(11) 99999-9999",
    cidade: "São Paulo",
    redes_sociais: "instagram.com/test_titanium",
    banco: "Itaú Unibanco",
    tipo_conta: "Corrente",
    agencia: "0001",
    conta: "99999-9",
    operacao: "",
    chave_pix: "test-e2e-onboarding@titanium.com.br",
    titular_nome: "Teste Automatizado E2E",
    
    // Novos campos comerciais da Página 2 do PDF (Dropdowns pré-prontos)
    vende_consorcio: true,
    principal_produto: "Consórcio Imobiliário",
    trabalha_carta_contemplada: "Sim",
    principal_publico: "Investidores",
    quantidade_indicacoes: "6 a 15 indicações",
    quer_atuar_como: "Parceiro Titanium",
    quantidade_colaboradores: "1 a 4 colaboradores",
    aceita_receber_contatos: true,
    aceite_playbook: true
  };

  try {
    const response = await fetch(TARGET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Titanium-E2E-Tester/1.0"
      },
      body: JSON.stringify(payload)
    });

    const status = response.status;
    const body = await response.json();

    console.log(`\n==================================================`);
    console.log(`STATUS HTTP: ${status}`);
    console.log(`RESPOSTA:`, JSON.stringify(body, null, 2));
    console.log(`==================================================\n`);

    if (status === 201 && body.success) {
      console.log("✅ TESTE E2E BEM-SUCEDIDO!");
      console.log(`Parceiro Ref: ${body.parceiro.codigo_ref}`);
      console.log("O registro foi devidamente persistido no Neon Postgres de Produção.");
      process.exit(0);
    } else {
      console.error("❌ FALHA NO TESTE E2E:", body.error || "Erro desconhecido");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ ERRO AO FAZER A REQUISIÇÃO E2E:", error.message);
    process.exit(1);
  }
}

runE2ETest();
