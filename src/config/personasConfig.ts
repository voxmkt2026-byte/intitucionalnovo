/* ──────────────────────────────────────────────────────────
   TITANIUM CONSULTORIAS — PERSONA FORM CONFIG
   Engine de Formulários Dinâmicos (Data-Driven UI)
   ────────────────────────────────────────────────────────── */

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'range';
  required: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  prefix?: string;
  suffix?: string;
}

export interface FormStep {
  title: string;
  subtitle?: string;
  fields: FormField[];
  ctaText: string;
}

export interface PersonaConfig {
  id: string;
  slug: string;
  name: string;
  tier: 1 | 2 | 3;
  theme: 'light' | 'dark';
  steps: FormStep[];
  whatsappTemplate: string;
  proofText?: string;      // Social proof (ex: "2.847 motoristas já conquistaram")
  securityBadge?: string;  // Badge customizado
}

/* ──────────────────────────────────────────────
   TIER 1 — MASSA (3 Etapas: Sonho → Valor → Dados)
   Renda R$2k-6k | Ticket R$50k-150k
   O lead ESCREVE o sonho dele. Zero opções limitadas.
   ────────────────────────────────────────────── */

const TIER1_DATA_STEP: FormStep = {
  title: 'Falta pouco para conquistar o seu!',
  subtitle: 'Preencha e receba sua proposta personalizada no WhatsApp.',
  ctaText: 'Receber Proposta no WhatsApp →',
  fields: [
    { id: 'nome', label: 'Seu nome completo', type: 'text', required: true, placeholder: 'Como quer ser chamado?' },
    { id: 'whatsapp', label: 'Seu WhatsApp com DDD', type: 'tel', required: true, placeholder: '(00) 90000-0000' },
    { id: 'email', label: 'E-mail (opcional)', type: 'email', required: false, placeholder: 'nome@exemplo.com' },
  ],
};

/* ──────────────────────────────────────────────
   TIER 2 — CLASSE MÉDIA (2 Etapas: Sonho+Valor → Dados)
   Renda R$6k-15k | Ticket R$150k-500k
   ────────────────────────────────────────────── */

const TIER2_DATA_STEP: FormStep = {
  title: 'Para onde enviamos a simulação?',
  subtitle: 'Análise transparente e sem juros bancários. Receba em menos de 5 minutos.',
  ctaText: 'Receber Simulação Completa →',
  fields: [
    { id: 'nome', label: 'Nome Completo', type: 'text', required: true, placeholder: 'Ex: Carlos Silva' },
    { id: 'whatsapp', label: 'WhatsApp de contato', type: 'tel', required: true, placeholder: '(00) 90000-0000' },
    { id: 'email', label: 'E-mail para envio formal (opcional)', type: 'email', required: false, placeholder: 'nome@exemplo.com' },
  ],
};

/* ══════════════════════════════════════════════════════════
   CONFIGURAÇÃO COMPLETA DAS 14 PERSONAS
   ══════════════════════════════════════════════════════════ */

export const personasConfig: Record<string, PersonaConfig> = {

  /* ─── TIER 1: MOTORISTA DE APP ─── */
  'uber': {
    id: 'motorista-app',
    slug: 'uber',
    name: 'Motorista de Aplicativo',
    tier: 1,
    theme: 'light',
    proofText: '2.847 motoristas já conquistaram o carro próprio',
    securityBadge: 'Sem consulta ao SPC. Dados protegidos.',
    whatsappTemplate: 'Olá! Sou motorista de app e quero conquistar meu carro próprio. Tenho interesse em um *[bem_desejado]* com parcelas de aproximadamente *R$ [parcela]*. Como funciona o consórcio com taxas menores que financiamento?',
    steps: [
      {
        title: '🚗 Qual carro você quer colocar na garagem?',
        subtitle: 'Sem entrada. Sem juros abusivos. Sem banco.',
        ctaText: 'Avançar →',
        fields: [
          { id: 'bem_desejado', label: 'Escreva o carro dos seus sonhos', type: 'text', required: true, placeholder: 'Ex: HB20, Onix, Spin, Argo...' },
        ],
      },
      {
        title: '💰 Quanto você pode investir por mês?',
        subtitle: 'Encontramos parcelas que cabem no seu faturamento de app.',
        ctaText: 'Simular Parcelas →',
        fields: [
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', required: true, min: 400, max: 2500, step: 50, defaultValue: 800, prefix: 'R$', suffix: '/mês' },
        ],
      },
      { ...TIER1_DATA_STEP },
    ],
  },

  /* ─── TIER 1: CAMINHONEIRO ─── */
  'caminhao': {
    id: 'caminhoneiro',
    slug: 'caminhao',
    name: 'Caminhoneiro Autônomo',
    tier: 1,
    theme: 'dark',
    proofText: '1.340 caminhoneiros já conquistaram a frota própria',
    securityBadge: 'Sem burocracia. Sem fiador. Dados protegidos.',
    whatsappTemplate: 'Olá! Trabalho com fretes e quero conquistar meu caminhão próprio. Tenho interesse em um *[bem_desejado]* com parcelas de aproximadamente *R$ [parcela]*. Quero saber mais!',
    steps: [
      {
        title: '🚛 Qual caminhão vai colocar na estrada?',
        subtitle: 'Chega de pagar frete pra terceiro. Conquiste a independência.',
        ctaText: 'Avançar →',
        fields: [
          { id: 'bem_desejado', label: 'Escreva o caminhão que você quer', type: 'text', required: true, placeholder: 'Ex: 3/4, Toco, Truck, Cavalo Mecânico...' },
        ],
      },
      {
        title: '💰 Quanto quer pagar por mês sem se endividar?',
        subtitle: 'Parcelas que cabem no faturamento das suas viagens.',
        ctaText: 'Simular Parcelas →',
        fields: [
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', required: true, min: 1000, max: 8000, step: 250, defaultValue: 2500, prefix: 'R$', suffix: '/mês' },
        ],
      },
      {
        ...TIER1_DATA_STEP,
        title: 'Garanta suas condições especiais de frota!',
        subtitle: 'Sua simulação está pronta. Informe onde deseja receber.',
        ctaText: 'Receber Orçamento no WhatsApp →',
      },
    ],
  },

  /* ─── TIER 1: CARTA COMUM ─── */
  'carta-comum': {
    id: 'carta-comum',
    slug: 'carta-comum',
    name: 'Carta de Consórcio',
    tier: 1,
    theme: 'light',
    proofText: '5.200+ clientes já economizaram com consórcio',
    securityBadge: 'Sem juros bancários. Dados protegidos.',
    whatsappTemplate: 'Olá! Quero simular uma carta de consórcio para *[bem_desejado]* com parcelas de aproximadamente *R$ [parcela]*. Pode me ajudar?',
    steps: [
      {
        title: '📋 O que você quer conquistar com o consórcio?',
        subtitle: 'Compare com o financiamento e veja a economia real.',
        ctaText: 'Avançar →',
        fields: [
          { id: 'bem_desejado', label: 'Descreva o que deseja adquirir', type: 'text', required: true, placeholder: 'Ex: Carro popular, apartamento, terreno...' },
        ],
      },
      {
        title: '💰 Qual parcela cabe no seu bolso?',
        subtitle: 'Parcelas flexíveis sem os juros do banco.',
        ctaText: 'Ver Simulação →',
        fields: [
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', required: true, min: 300, max: 5000, step: 100, defaultValue: 1000, prefix: 'R$', suffix: '/mês' },
        ],
      },
      { ...TIER1_DATA_STEP },
    ],
  },

  /* ─── TIER 1: CORRETOR PARCEIRO ─── */
  'corretor': {
    id: 'corretor',
    slug: 'corretor',
    name: 'Corretor Parceiro',
    tier: 1,
    theme: 'light',
    proofText: '380 corretores parceiros ativos na rede Titanium',
    securityBadge: 'Programa de parceria oficial. Dados protegidos.',
    whatsappTemplate: 'Olá! Sou corretor e tenho interesse no programa de parceria da Titanium. Trabalho com *[bem_desejado]* e quero entender as comissões e ferramentas disponíveis.',
    steps: [
      {
        title: '🤝 Quer vender consórcio e ganhar comissões?',
        subtitle: 'Parceria oficial com as maiores administradoras do Brasil.',
        ctaText: 'Avançar →',
        fields: [
          { id: 'bem_desejado', label: 'Qual segmento você trabalha?', type: 'text', required: true, placeholder: 'Ex: Imóveis, veículos, agro, energia solar...' },
        ],
      },
      {
        title: '💼 Quantos clientes você atende por mês?',
        subtitle: 'Queremos entender seu potencial para dimensionar o suporte.',
        ctaText: 'Avançar →',
        fields: [
          { id: 'volume_clientes', label: 'Volume mensal estimado', type: 'text', required: true, placeholder: 'Ex: 5 a 10 clientes, mais de 20...' },
        ],
      },
      {
        ...TIER1_DATA_STEP,
        title: 'Entre para a rede Titanium!',
        subtitle: 'Preencha e um gestor de parceria entra em contato.',
        ctaText: 'Quero Ser Parceiro →',
      },
    ],
  },

  /* ─── TIER 2: TERRENOS CONSTRUÇÃO ─── */
  'terrenos-construcao': {
    id: 'terrenos-construcao',
    slug: 'terrenos-construcao',
    name: 'Terrenos e Construção',
    tier: 2,
    theme: 'light',
    proofText: '1.890 famílias já construíram a casa própria',
    securityBadge: 'Sem entrada obrigatória. Dados protegidos.',
    whatsappTemplate: 'Olá! Estou planejando *[bem_desejado]*. Quero simular um crédito com parcelas de aproximadamente *R$ [parcela]*. Como funciona o consórcio para construção?',
    steps: [
      {
        title: '🏗️ Qual o tamanho do seu projeto de vida?',
        subtitle: 'Use o consórcio para comprar terreno e construir do seu jeito.',
        ctaText: 'Avançar para Proposta →',
        fields: [
          { id: 'bem_desejado', label: 'Descreva seu projeto', type: 'text', required: true, placeholder: 'Ex: Terreno 300m² + casa 3 quartos...' },
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', required: true, min: 800, max: 8000, step: 200, defaultValue: 2000, prefix: 'R$', suffix: '/mês' },
        ],
      },
      { ...TIER2_DATA_STEP },
    ],
  },

  /* ─── TIER 2: TERRENOS AGRÍCOLAS ─── */
  'terrenos-agricolas': {
    id: 'terrenos-agricolas',
    slug: 'terrenos-agricolas',
    name: 'Terrenos Agrícolas',
    tier: 2,
    theme: 'light',
    proofText: '720 produtores expandiram suas terras com consórcio',
    securityBadge: 'Sem burocracia bancária. Dados protegidos.',
    whatsappTemplate: 'Olá! Sou produtor rural e quero expandir minha área. Tenho interesse em *[bem_desejado]* com parcelas de aproximadamente *R$ [parcela]*. Quero entender as condições.',
    steps: [
      {
        title: '🌾 Quanto de terra quer para expandir a produção?',
        subtitle: 'Investimento em terra com planejamento inteligente.',
        ctaText: 'Avançar para Proposta →',
        fields: [
          { id: 'bem_desejado', label: 'Descreva a área que precisa', type: 'text', required: true, placeholder: 'Ex: 50 hectares para soja, pasto para gado...' },
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', required: true, min: 1500, max: 15000, step: 500, defaultValue: 4000, prefix: 'R$', suffix: '/mês' },
        ],
      },
      { ...TIER2_DATA_STEP },
    ],
  },

  /* ─── TIER 2: MÁQUINAS AGRÍCOLAS ─── */
  'maquinas-agricolas': {
    id: 'maquinas-agricolas',
    slug: 'maquinas-agricolas',
    name: 'Máquinas Agrícolas',
    tier: 2,
    theme: 'light',
    proofText: '940 produtores mecanizaram a lavoura com consórcio',
    securityBadge: 'Sem financiamento rural burocrático. Dados protegidos.',
    whatsappTemplate: 'Olá! Sou produtor e preciso de *[bem_desejado]* para a fazenda. Quero parcelas de aproximadamente *R$ [parcela]*. Como funciona?',
    steps: [
      {
        title: '🚜 Qual máquina vai aumentar sua produtividade?',
        subtitle: 'Mecanize sem depender de crédito rural burocrático.',
        ctaText: 'Avançar para Proposta →',
        fields: [
          { id: 'bem_desejado', label: 'Descreva a máquina que precisa', type: 'text', required: true, placeholder: 'Ex: Trator John Deere, colheitadeira, plantadeira...' },
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', required: true, min: 2000, max: 20000, step: 500, defaultValue: 5000, prefix: 'R$', suffix: '/mês' },
        ],
      },
      { ...TIER2_DATA_STEP },
    ],
  },

  /* ─── TIER 2: CARTA CONTEMPLADA ─── */
  'carta-contemplada': {
    id: 'carta-contemplada',
    slug: 'carta-contemplada',
    name: 'Carta Contemplada',
    tier: 2,
    theme: 'dark',
    proofText: '3.100+ cartas contempladas negociadas',
    securityBadge: 'Cartas verificadas e com seguro. Dados protegidos.',
    whatsappTemplate: 'Olá! Quero comprar uma carta contemplada para *[bem_desejado]* com crédito de aproximadamente *R$ [parcela]*. Quais cartas vocês têm disponíveis agora?',
    steps: [
      {
        title: '⚡ Precisa do crédito rápido? Carta contemplada é a solução.',
        subtitle: 'Cartas prontas para uso imediato. Sem esperar sorteio.',
        ctaText: 'Avançar para Proposta →',
        fields: [
          { id: 'bem_desejado', label: 'O que você quer comprar com a carta?', type: 'text', required: true, placeholder: 'Ex: Apartamento, carro, terreno...' },
          { id: 'parcela', label: 'Valor de crédito desejado', type: 'range', required: true, min: 50000, max: 1000000, step: 25000, defaultValue: 200000, prefix: 'R$', suffix: '' },
        ],
      },
      {
        ...TIER2_DATA_STEP,
        title: 'Receba as cartas disponíveis agora!',
        subtitle: 'Enviamos as opções com valores e condições no seu WhatsApp.',
        ctaText: 'Ver Cartas Disponíveis →',
      },
    ],
  },

  /* ─── TIER 2: PLACAS SOLARES ─── */
  'placas-solares': {
    id: 'placas-solares',
    slug: 'placas-solares',
    name: 'Energia Solar',
    tier: 2,
    theme: 'light',
    proofText: '460 sistemas solares financiados via consórcio',
    securityBadge: 'Economia na conta de luz desde o 1º mês. Dados protegidos.',
    whatsappTemplate: 'Olá! Quero instalar *[bem_desejado]* na minha propriedade. Parcelas de aproximadamente *R$ [parcela]*. Qual o melhor plano?',
    steps: [
      {
        title: '☀️ Quanto você paga de conta de luz?',
        subtitle: 'Use o consórcio para reduzir significativamente sua conta de energia e gerar economia por 25 anos.',
        ctaText: 'Avançar para Proposta →',
        fields: [
          { id: 'bem_desejado', label: 'Descreva seu projeto de energia solar', type: 'text', required: true, placeholder: 'Ex: Sistema 10kWp para residência, fazenda...' },
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', required: true, min: 500, max: 5000, step: 100, defaultValue: 1200, prefix: 'R$', suffix: '/mês' },
        ],
      },
      { ...TIER2_DATA_STEP },
    ],
  },

  /* ──────────────────────────────────────────────
     TIER 3 — HIGH TICKET (1 Etapa: Ultra Direto)
     Renda R$15k-50k+ | Ticket R$500k-2M+
     Objetividade total. Nome + WhatsApp + Desejo.
     ────────────────────────────────────────────── */

  /* ─── TIER 3: CARRO DE LUXO ─── */
  'carro-luxo': {
    id: 'carro-luxo',
    slug: 'carro-luxo',
    name: 'Veículos Premium',
    tier: 3,
    theme: 'dark',
    whatsappTemplate: 'Olá! Tenho interesse na aquisição inteligente de *[bem_desejado]* através de consórcio estruturado. Aguardo retorno de um especialista.',
    steps: [
      {
        title: 'Aquisição Inteligente de Veículos Premium',
        subtitle: 'Alavanque patrimônio sem imobilizar capital e livre de juros.',
        ctaText: 'Iniciar Atendimento Exclusivo →',
        fields: [
          { id: 'nome', label: 'Nome completo', type: 'text', required: true, placeholder: 'Como prefere ser tratado?' },
          { id: 'whatsapp', label: 'WhatsApp direto', type: 'tel', required: true, placeholder: '(00) 90000-0000' },
          { id: 'bem_desejado', label: 'Qual veículo deseja adquirir?', type: 'text', required: true, placeholder: 'Ex: BMW X5, Porsche Cayenne, Mercedes GLC...' },
          { id: 'email', label: 'E-mail corporativo (opcional)', type: 'email', required: false, placeholder: 'exemplo@empresa.com' },
        ],
      },
    ],
  },

  /* ─── TIER 3: EMPRESÁRIO ─── */
  'empresario': {
    id: 'empresario',
    slug: 'empresario',
    name: 'Empresário / PJ',
    tier: 3,
    theme: 'dark',
    whatsappTemplate: 'Olá! Sou empresário e quero estruturar a aquisição de *[bem_desejado]* via consórcio para minha empresa. Aguardo contato de um consultor.',
    steps: [
      {
        title: 'Estruturação Patrimonial para Empresários',
        subtitle: 'Imóvel comercial, frota ou patrimônio — sem descapitalizar o caixa.',
        ctaText: 'Falar com Consultor Empresarial →',
        fields: [
          { id: 'nome', label: 'Nome / Razão Social', type: 'text', required: true, placeholder: 'Como prefere ser tratado?' },
          { id: 'whatsapp', label: 'WhatsApp direto', type: 'tel', required: true, placeholder: '(00) 90000-0000' },
          { id: 'bem_desejado', label: 'O que deseja adquirir para a empresa?', type: 'text', required: true, placeholder: 'Ex: Sala comercial, frota de veículos, galpão...' },
          { id: 'email', label: 'E-mail corporativo (opcional)', type: 'email', required: false, placeholder: 'exemplo@empresa.com' },
        ],
      },
    ],
  },

  /* ─── TIER 3: SERVIÇOS ─── */
  'servicos': {
    id: 'servicos',
    slug: 'servicos',
    name: 'Serviços / Clínicas / Escritórios',
    tier: 3,
    theme: 'dark',
    whatsappTemplate: 'Olá! Sou prestador de serviços/empresário e tenho interesse em adquirir *[bem_desejado]* via consórcio. Gostaria de falar com um consultor especializado.',
    steps: [
      {
        title: 'Planejamento para Clínicas e Empresas de Serviço',
        subtitle: 'Consultório, clínica, escritório ou sede própria — sem juros bancários.',
        ctaText: 'Falar com Consultor Especializado →',
        fields: [
          { id: 'nome', label: 'Nome completo', type: 'text', required: true, placeholder: 'Como prefere ser chamado?' },
          { id: 'whatsapp', label: 'WhatsApp direto', type: 'tel', required: true, placeholder: '(00) 90000-0000' },
          { id: 'bem_desejado', label: 'O que deseja adquirir?', type: 'text', required: true, placeholder: 'Ex: Aparelho de estética, reforma, imóvel comercial...' },
          { id: 'email', label: 'E-mail corporativo (opcional)', type: 'email', required: false, placeholder: 'contato@empresa.com' },
        ],
      },
    ],
  },

  /* ─── TIER 3: AERONAVES ─── */
  'aeronaves': {
    id: 'aeronaves',
    slug: 'aeronaves',
    name: 'Aeronaves e Helicópteros',
    tier: 3,
    theme: 'dark',
    whatsappTemplate: 'Olá! Gostaria de falar com um consultor para estruturar a aquisição de *[bem_desejado]* via consórcio aeronáutico. Aguardo retorno.',
    steps: [
      {
        title: 'Aquisição de Aeronaves Executivas',
        subtitle: 'Estruturação financeira de elite para alta mobilidade.',
        ctaText: 'Falar com Consultor Private →',
        fields: [
          { id: 'nome', label: 'Nome / Representante', type: 'text', required: true, placeholder: 'Seu nome' },
          { id: 'whatsapp', label: 'WhatsApp corporativo', type: 'tel', required: true, placeholder: '(00) 90000-0000' },
          { id: 'bem_desejado', label: 'Qual aeronave deseja adquirir?', type: 'text', required: true, placeholder: 'Ex: Helicóptero, jato executivo, turboélice...' },
          { id: 'email', label: 'E-mail corporativo (opcional)', type: 'email', required: false, placeholder: 'exemplo@empresa.com' },
        ],
      },
    ],
  },

  /* ─── TIER 3: EMBARCAÇÕES ─── */
  'embarcacao': {
    id: 'embarcacao',
    slug: 'embarcacao',
    name: 'Embarcações',
    tier: 3,
    theme: 'dark',
    whatsappTemplate: 'Olá! Tenho interesse em adquirir *[bem_desejado]* via consórcio náutico. Gostaria de falar com um consultor especializado.',
    steps: [
      {
        title: 'Aquisição de Embarcações de Lazer e Esporte',
        subtitle: 'Lancha, iate ou veleiro — planejamento financeiro exclusivo.',
        ctaText: 'Falar com Consultor Náutico →',
        fields: [
          { id: 'nome', label: 'Nome completo', type: 'text', required: true, placeholder: 'Como prefere ser tratado?' },
          { id: 'whatsapp', label: 'WhatsApp direto', type: 'tel', required: true, placeholder: '(00) 90000-0000' },
          { id: 'bem_desejado', label: 'Qual embarcação deseja adquirir?', type: 'text', required: true, placeholder: 'Ex: Lancha 30 pés, iate, jet ski...' },
          { id: 'email', label: 'E-mail (opcional)', type: 'email', required: false, placeholder: 'exemplo@email.com' },
        ],
      },
    ],
  },
};

/* ──────────────────────────────────────────────
   HELPER: busca por slug
   ────────────────────────────────────────────── */
export function getPersonaBySlug(slug: string): PersonaConfig | undefined {
  return personasConfig[slug];
}

export function getAllPersonaSlugs(): string[] {
  return Object.keys(personasConfig);
}
