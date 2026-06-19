/* ══════════════════════════════════════════════════════════════
   TITANIUM DREAM FORM ENGINE v1.0
   Self-contained form widget for static HTML landing pages.
   Renders multi-step forms based on persona config.
   Sends leads to /api/leads + redirects to WhatsApp.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var WA_NUMBER = '5511930048940';
  var LEADS_API = '/api/leads';

  /* ── PERSONA CONFIGS ── */
  var PERSONAS = {
    'uber': {
      tier: 1, theme: 'light',
      proof: '2.847 motoristas já conquistaram o carro próprio',
      badge: 'Sem consulta ao SPC. Dados protegidos.',
      wa: 'Olá! Sou motorista de app e quero conquistar meu carro próprio. Tenho interesse em um *{bem}* com parcelas de aproximadamente *R$ {parcela}*. Como funciona?',
      steps: [
        { title: 'Qual carro você quer colocar na garagem?', sub: 'Sem entrada. Taxas menores que financiamento. Sem banco.', cta: 'Avançar →', fields: [
          { id: 'bem_desejado', label: 'Escreva o carro dos seus sonhos', type: 'text', req: true, ph: 'Ex: HB20, Onix, Spin, Argo...' }
        ]},
        { title: 'Quanto você pode investir por mês?', sub: 'Encontramos parcelas que cabem no seu faturamento de app.', cta: 'Simular Parcelas →', fields: [
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', req: true, min: 400, max: 2500, step: 50, def: 800 }
        ]},
        { title: 'Falta pouco para conquistar o seu!', sub: 'Preencha e receba sua proposta personalizada no WhatsApp.', cta: 'Receber Proposta no WhatsApp →', fields: [
          { id: 'nome', label: 'Seu nome completo', type: 'text', req: true, ph: 'Como quer ser chamado?' },
          { id: 'whatsapp', label: 'Seu WhatsApp com DDD', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'email', label: 'E-mail (opcional)', type: 'email', req: false, ph: 'nome@exemplo.com' }
        ]}
      ]
    },
    'caminhao': {
      tier: 1, theme: 'dark',
      proof: '1.340 caminhoneiros já conquistaram a frota própria',
      badge: 'Sem burocracia. Sem fiador. Dados protegidos.',
      wa: 'Olá! Trabalho com fretes e quero meu caminhão próprio. Tenho interesse em um *{bem}* com parcelas de aproximadamente *R$ {parcela}*. Quero saber mais!',
      steps: [
        { title: 'Qual caminhão vai colocar na estrada?', sub: 'Chega de pagar frete pra terceiro. Conquiste a independência.', cta: 'Avançar →', fields: [
          { id: 'bem_desejado', label: 'Escreva o caminhão que você quer', type: 'text', req: true, ph: 'Ex: 3/4, Toco, Truck, Cavalo Mecânico...' }
        ]},
        { title: 'Quanto quer pagar por mês sem se endividar?', sub: 'Parcelas que cabem no faturamento das suas viagens.', cta: 'Simular Parcelas →', fields: [
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', req: true, min: 1000, max: 8000, step: 250, def: 2500 }
        ]},
        { title: 'Garanta suas condições especiais de frota!', sub: 'Sua simulação está pronta. Informe onde deseja receber.', cta: 'Receber Orçamento no WhatsApp →', fields: [
          { id: 'nome', label: 'Nome completo', type: 'text', req: true, ph: 'Como quer ser chamado?' },
          { id: 'whatsapp', label: 'WhatsApp com DDD', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'email', label: 'E-mail (opcional)', type: 'email', req: false, ph: 'nome@exemplo.com' }
        ]}
      ]
    },
    'carta-comum': {
      tier: 1, theme: 'light',
      proof: '5.200+ clientes já economizaram com consórcio',
      badge: 'Sem juros bancários. Dados protegidos.',
      wa: 'Olá! Quero simular uma carta de consórcio para *{bem}* com parcelas de aproximadamente *R$ {parcela}*. Pode me ajudar?',
      steps: [
        { title: 'O que você quer conquistar com o consórcio?', sub: 'Compare com o financiamento e veja a economia real.', cta: 'Avançar →', fields: [
          { id: 'bem_desejado', label: 'Descreva o que deseja adquirir', type: 'text', req: true, ph: 'Ex: Carro popular, apartamento, terreno...' }
        ]},
        { title: 'Qual parcela cabe no seu bolso?', sub: 'Parcelas flexíveis sem os juros do banco.', cta: 'Ver Simulação →', fields: [
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', req: true, min: 300, max: 5000, step: 100, def: 1000 }
        ]},
        { title: 'Falta pouco para conquistar o seu!', sub: 'Preencha e receba sua proposta personalizada no WhatsApp.', cta: 'Receber Proposta no WhatsApp →', fields: [
          { id: 'nome', label: 'Seu nome completo', type: 'text', req: true, ph: 'Como quer ser chamado?' },
          { id: 'whatsapp', label: 'Seu WhatsApp com DDD', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'email', label: 'E-mail (opcional)', type: 'email', req: false, ph: 'nome@exemplo.com' }
        ]}
      ]
    },
    'corretor': {
      tier: 1, theme: 'light',
      proof: '380 corretores parceiros ativos na rede Titanium',
      badge: 'Programa de parceria oficial. Dados protegidos.',
      wa: 'Olá! Sou corretor e tenho interesse no programa de parceria da Titanium. Trabalho com *{bem}* e quero entender as comissões e ferramentas.',
      steps: [
        { title: 'Quer vender consórcio e ganhar comissões?', sub: 'Parceria oficial com as maiores administradoras do Brasil.', cta: 'Avançar →', fields: [
          { id: 'bem_desejado', label: 'Qual segmento você trabalha?', type: 'text', req: true, ph: 'Ex: Imóveis, veículos, agro, energia solar...' }
        ]},
        { title: 'Quantos clientes você atende por mês?', sub: 'Queremos entender seu potencial para dimensionar o suporte.', cta: 'Avançar →', fields: [
          { id: 'parcela', label: 'Volume mensal estimado', type: 'text', req: true, ph: 'Ex: 5 a 10 clientes, mais de 20...' }
        ]},
        { title: 'Entre para a rede Titanium!', sub: 'Preencha e um gestor de parceria entra em contato.', cta: 'Quero Ser Parceiro →', fields: [
          { id: 'nome', label: 'Nome completo', type: 'text', req: true, ph: 'Como quer ser chamado?' },
          { id: 'whatsapp', label: 'WhatsApp com DDD', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'email', label: 'E-mail (opcional)', type: 'email', req: false, ph: 'nome@exemplo.com' }
        ]}
      ]
    },
    'terrenos-construcao': {
      tier: 2, theme: 'light',
      proof: '1.890 famílias já construíram a casa própria',
      badge: 'Sem entrada obrigatória. Dados protegidos.',
      wa: 'Olá! Estou planejando *{bem}*. Quero simular um crédito com parcelas de aproximadamente *R$ {parcela}*. Como funciona o consórcio para construção?',
      steps: [
        { title: 'Qual o tamanho do seu projeto de vida?', sub: 'Use o consórcio para comprar terreno e construir do seu jeito.', cta: 'Avançar para Proposta →', fields: [
          { id: 'bem_desejado', label: 'Descreva seu projeto', type: 'text', req: true, ph: 'Ex: Terreno 300m² + casa 3 quartos...' },
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', req: true, min: 800, max: 8000, step: 200, def: 2000 }
        ]},
        { title: 'Para onde enviamos a simulação?', sub: 'Análise transparente e sem juros bancários. Receba em menos de 5 minutos.', cta: 'Receber Simulação Completa →', fields: [
          { id: 'nome', label: 'Nome completo', type: 'text', req: true, ph: 'Ex: Carlos Silva' },
          { id: 'whatsapp', label: 'WhatsApp de contato', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'email', label: 'E-mail (opcional)', type: 'email', req: false, ph: 'nome@exemplo.com' }
        ]}
      ]
    },
    'terrenos-agricolas': {
      tier: 2, theme: 'light',
      proof: '720 produtores expandiram suas terras com consórcio',
      badge: 'Sem burocracia bancária. Dados protegidos.',
      wa: 'Olá! Sou produtor rural e quero expandir minha área. Tenho interesse em *{bem}* com parcelas de aproximadamente *R$ {parcela}*. Quero entender as condições.',
      steps: [
        { title: 'Quanto de terra quer para expandir?', sub: 'Investimento em terra com planejamento inteligente.', cta: 'Avançar para Proposta →', fields: [
          { id: 'bem_desejado', label: 'Descreva a área que precisa', type: 'text', req: true, ph: 'Ex: 50 hectares para soja, pasto para gado...' },
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', req: true, min: 1500, max: 15000, step: 500, def: 4000 }
        ]},
        { title: 'Para onde enviamos a simulação?', sub: 'Análise transparente e sem juros bancários. Receba em menos de 5 minutos.', cta: 'Receber Simulação Completa →', fields: [
          { id: 'nome', label: 'Nome completo', type: 'text', req: true, ph: 'Ex: Carlos Silva' },
          { id: 'whatsapp', label: 'WhatsApp de contato', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'email', label: 'E-mail (opcional)', type: 'email', req: false, ph: 'nome@exemplo.com' }
        ]}
      ]
    },
    'maquinas-agricolas': {
      tier: 2, theme: 'light',
      proof: '940 produtores mecanizaram a lavoura com consórcio',
      badge: 'Sem financiamento rural burocrático. Dados protegidos.',
      wa: 'Olá! Sou produtor e preciso de *{bem}* para a fazenda. Quero parcelas de aproximadamente *R$ {parcela}*. Como funciona?',
      steps: [
        { title: 'Qual máquina vai aumentar sua produtividade?', sub: 'Mecanize sem depender de crédito rural burocrático.', cta: 'Avançar para Proposta →', fields: [
          { id: 'bem_desejado', label: 'Descreva a máquina que precisa', type: 'text', req: true, ph: 'Ex: Trator John Deere, colheitadeira, plantadeira...' },
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', req: true, min: 2000, max: 20000, step: 500, def: 5000 }
        ]},
        { title: 'Para onde enviamos a simulação?', sub: 'Análise transparente e sem juros bancários. Receba em menos de 5 minutos.', cta: 'Receber Simulação Completa →', fields: [
          { id: 'nome', label: 'Nome completo', type: 'text', req: true, ph: 'Ex: Carlos Silva' },
          { id: 'whatsapp', label: 'WhatsApp de contato', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'email', label: 'E-mail (opcional)', type: 'email', req: false, ph: 'nome@exemplo.com' }
        ]}
      ]
    },
    'carta-contemplada': {
      tier: 2, theme: 'dark',
      proof: '3.100+ cartas contempladas negociadas',
      badge: 'Cartas verificadas e com seguro. Dados protegidos.',
      wa: 'Olá! Quero comprar uma carta contemplada para *{bem}* com crédito de aproximadamente *R$ {parcela}*. Quais cartas vocês têm disponíveis?',
      steps: [
        { title: 'Precisa do crédito rápido?', sub: 'Cartas contempladas prontas para uso imediato. Sem esperar sorteio.', cta: 'Avançar para Proposta →', fields: [
          { id: 'bem_desejado', label: 'O que você quer comprar com a carta?', type: 'text', req: true, ph: 'Ex: Apartamento, carro, terreno...' },
          { id: 'parcela', label: 'Valor de crédito desejado', type: 'range', req: true, min: 50000, max: 1000000, step: 25000, def: 200000 }
        ]},
        { title: 'Receba as cartas disponíveis agora!', sub: 'Enviamos opções com valores e condições no seu WhatsApp.', cta: 'Ver Cartas Disponíveis →', fields: [
          { id: 'nome', label: 'Nome completo', type: 'text', req: true, ph: 'Ex: Carlos Silva' },
          { id: 'whatsapp', label: 'WhatsApp de contato', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'email', label: 'E-mail (opcional)', type: 'email', req: false, ph: 'nome@exemplo.com' }
        ]}
      ]
    },
    'placas-solares': {
      tier: 2, theme: 'light',
      proof: '460 sistemas solares financiados via consórcio',
      badge: 'Economia na conta de luz desde o 1º mês. Dados protegidos.',
      wa: 'Olá! Quero instalar *{bem}* na minha propriedade. Parcelas de aproximadamente *R$ {parcela}*. Qual o melhor plano?',
      steps: [
        { title: 'Invista em energia solar e reduza sua conta de luz', sub: 'Use o consórcio para instalar energia solar e economizar por 25 anos.', cta: 'Avançar para Proposta →', fields: [
          { id: 'bem_desejado', label: 'Descreva seu projeto de energia solar', type: 'text', req: true, ph: 'Ex: Sistema 10kWp para residência, fazenda...' },
          { id: 'parcela', label: 'Parcela mensal desejada', type: 'range', req: true, min: 500, max: 5000, step: 100, def: 1200 }
        ]},
        { title: 'Para onde enviamos a simulação?', sub: 'Análise transparente e sem juros bancários. Receba em menos de 5 minutos.', cta: 'Receber Simulação Completa →', fields: [
          { id: 'nome', label: 'Nome completo', type: 'text', req: true, ph: 'Ex: Carlos Silva' },
          { id: 'whatsapp', label: 'WhatsApp de contato', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'email', label: 'E-mail (opcional)', type: 'email', req: false, ph: 'nome@exemplo.com' }
        ]}
      ]
    },
    'carro-luxo': {
      tier: 3, theme: 'dark',
      proof: '320 veículos premium entregues · R$ 48M em créditos intermediados',
      badge: 'Atendimento exclusivo. Dados protegidos.',
      wa: 'Olá! Tenho interesse na aquisição inteligente de *{bem}* através de consórcio estruturado. Aguardo retorno de um especialista.',
      steps: [
        { title: 'Aquisição Inteligente de Veículos Premium', sub: 'Alavanque patrimônio sem imobilizar capital e livre de juros.', cta: 'Iniciar Atendimento Exclusivo →', fields: [
          { id: 'nome', label: 'Nome completo', type: 'text', req: true, ph: 'Como prefere ser tratado?' },
          { id: 'whatsapp', label: 'WhatsApp direto', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'bem_desejado', label: 'Qual veículo deseja adquirir?', type: 'text', req: true, ph: 'Ex: BMW X5, Porsche Cayenne, Mercedes GLC...' },
          { id: 'email', label: 'E-mail corporativo (opcional)', type: 'email', req: false, ph: 'exemplo@empresa.com' }
        ]}
      ]
    },
    'empresario': {
      tier: 3, theme: 'dark',
      proof: '',
      badge: 'Atendimento PJ especializado. Dados protegidos.',
      wa: 'Olá! Sou empresário e quero estruturar a aquisição de *{bem}* via consórcio para minha empresa. Aguardo contato.',
      steps: [
        { title: 'Estruturação Patrimonial para Empresários', sub: 'Imóvel comercial, frota ou patrimônio — sem descapitalizar o caixa.', cta: 'Falar com Consultor Empresarial →', fields: [
          { id: 'nome', label: 'Nome / Razão Social', type: 'text', req: true, ph: 'Como prefere ser tratado?' },
          { id: 'whatsapp', label: 'WhatsApp direto', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'bem_desejado', label: 'O que deseja adquirir para a empresa?', type: 'text', req: true, ph: 'Ex: Sala comercial, frota, galpão...' },
          { id: 'email', label: 'E-mail corporativo (opcional)', type: 'email', req: false, ph: 'exemplo@empresa.com' }
        ]}
      ]
    },
    'medico': {
      tier: 3, theme: 'dark',
      proof: '',
      badge: 'Atendimento especializado. Dados protegidos.',
      wa: 'Olá! Sou profissional de saúde e tenho interesse em adquirir *{bem}* via consórcio. Gostaria de falar com um consultor.',
      steps: [
        { title: 'Planejamento para Profissionais de Saúde', sub: 'Consultório, clínica ou imóvel — sem juros bancários.', cta: 'Falar com Consultor Especializado →', fields: [
          { id: 'nome', label: 'Nome completo', type: 'text', req: true, ph: 'Dr(a). ...' },
          { id: 'whatsapp', label: 'WhatsApp direto', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'bem_desejado', label: 'O que deseja adquirir?', type: 'text', req: true, ph: 'Ex: Consultório, clínica, apartamento...' },
          { id: 'email', label: 'E-mail (opcional)', type: 'email', req: false, ph: 'exemplo@clinica.com' }
        ]}
      ]
    },
    'aeronaves': {
      tier: 3, theme: 'dark',
      proof: '',
      badge: 'Consultoria private. Dados protegidos.',
      wa: 'Olá! Gostaria de falar com um consultor para estruturar a aquisição de *{bem}* via consórcio aeronáutico. Aguardo retorno.',
      steps: [
        { title: 'Aquisição de Aeronaves Executivas', sub: 'Estruturação financeira de elite para alta mobilidade.', cta: 'Falar com Consultor Private →', fields: [
          { id: 'nome', label: 'Nome / Representante', type: 'text', req: true, ph: 'Seu nome' },
          { id: 'whatsapp', label: 'WhatsApp corporativo', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'bem_desejado', label: 'Qual aeronave deseja adquirir?', type: 'text', req: true, ph: 'Ex: Helicóptero, jato executivo, turboélice...' },
          { id: 'email', label: 'E-mail corporativo (opcional)', type: 'email', req: false, ph: 'exemplo@empresa.com' }
        ]}
      ]
    },
    'embarcacao': {
      tier: 3, theme: 'dark',
      proof: '',
      badge: 'Consultoria náutica. Dados protegidos.',
      wa: 'Olá! Tenho interesse em adquirir *{bem}* via consórcio náutico. Gostaria de falar com um consultor.',
      steps: [
        { title: 'Aquisição de Embarcações', sub: 'Lancha, iate ou veleiro — planejamento financeiro exclusivo.', cta: 'Falar com Consultor Náutico →', fields: [
          { id: 'nome', label: 'Nome completo', type: 'text', req: true, ph: 'Como prefere ser tratado?' },
          { id: 'whatsapp', label: 'WhatsApp direto', type: 'tel', req: true, ph: '(00) 90000-0000' },
          { id: 'bem_desejado', label: 'Qual embarcação deseja adquirir?', type: 'text', req: true, ph: 'Ex: Lancha 30 pés, iate, jet ski...' },
          { id: 'email', label: 'E-mail (opcional)', type: 'email', req: false, ph: 'exemplo@email.com' }
        ]}
      ]
    }
  };

  /* ── PHONE MASK ── */
  function maskPhone(v) {
    v = v.replace(/\D/g, '').substring(0, 11);
    if (v.length > 6) return '(' + v.substring(0, 2) + ') ' + v.substring(2, 7) + '-' + v.substring(7);
    if (v.length > 2) return '(' + v.substring(0, 2) + ') ' + v.substring(2);
    if (v.length > 0) return '(' + v;
    return '';
  }

  /* ── FORMAT CURRENCY ── */
  function fmtCurrency(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /* ── ANALYTICS ── */
  function track(ev, data) {
    try {
      if (window.dataLayer) window.dataLayer.push(Object.assign({ event: ev }, data));
      if (window.fbq) window.fbq('trackCustom', ev, data);
    } catch (e) { /* silent */ }
  }

  /* ── IDENTIFIER CAPTURE (Ciclo Infinito de Dados) ── */
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : '';
  }

  function captureIdentifiers() {
    var stored = sessionStorage.getItem('tf_ids');
    if (stored) return JSON.parse(stored);

    var params = new URLSearchParams(window.location.search);
    var fbclid = params.get('fbclid') || '';

    var ids = {
      ref: 'tf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      fbc: getCookie('_fbc') || (fbclid ? 'fb.1.' + Date.now() + '.' + fbclid : ''),
      fbp: getCookie('_fbp') || '',
      gclid: params.get('gclid') || '',
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || '',
      lp: window.location.pathname.replace(/\//g, '') || 'home',
      landing_time: new Date().toISOString()
    };

    sessionStorage.setItem('tf_ids', JSON.stringify(ids));
    return ids;
  }

  /* ── INJECT STYLES ── */
  function injectStyles(theme) {
    if (document.getElementById('df-styles')) return;
    var isDark = theme === 'dark';
    var bg = isDark ? '#0a0e0a' : '#f8f7f4';
    var cardBg = isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.92)';
    var cardBorder = isDark ? 'rgba(10,123,62,0.15)' : 'rgba(10,123,62,0.08)';
    var ink = isDark ? '#f0f0f0' : '#1a1a1a';
    var inkSoft = isDark ? 'rgba(255,255,255,0.5)' : '#6b7280';
    var inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb';
    var inputBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
    var green = '#0A7B3E';
    var greenGlow = isDark ? 'rgba(10,123,62,0.12)' : 'rgba(10,123,62,0.06)';
    var css = [
      '.df-section{padding:5rem 1.5rem;display:flex;justify-content:center;background:' + bg + '}',
      '.df-section .df-kicker{text-align:center;letter-spacing:.2em;font-size:.65rem;font-weight:600;color:' + green + ';margin-bottom:.6rem;font-family:Inter,system-ui,sans-serif;opacity:.8}',
      '.df-section .df-section-title{text-align:center;font-size:clamp(1.4rem,3.5vw,1.8rem);font-weight:600;margin-bottom:2.5rem;color:' + ink + ';font-family:Fraunces,serif;line-height:1.25;letter-spacing:-.01em}',
      '.df-section .df-section-title .df-grad{background:linear-gradient(135deg,' + green + ',#15B85C);-webkit-background-clip:text;-webkit-text-fill-color:transparent}',
      '.df-wrap{width:100%;max-width:440px}',
      '.df-box{position:relative;padding:2rem 1.75rem;border-radius:1.25rem;border:1px solid ' + cardBorder + ';background:' + cardBg + ';backdrop-filter:blur(24px) saturate(1.2);-webkit-backdrop-filter:blur(24px) saturate(1.2);box-shadow:0 1px 2px rgba(0,0,0,.04),0 8px 32px ' + greenGlow + ';transition:all .4s cubic-bezier(.4,0,.2,1)}',
      '.df-progress{display:flex;align-items:center;gap:0;margin-bottom:1.5rem}',
      '.df-progress-step{display:flex;align-items:center;flex:1}',
      '.df-progress-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;font-family:Inter,system-ui,sans-serif;border:2px solid ' + inputBorder + ';color:' + inkSoft + ';background:transparent;transition:all .3s;flex-shrink:0}',
      '.df-progress-dot.active{border-color:' + green + ';background:' + green + ';color:#fff;box-shadow:0 0 0 4px ' + greenGlow + '}',
      '.df-progress-dot.done{border-color:' + green + ';background:' + green + ';color:#fff}',
      '.df-progress-line{flex:1;height:2px;background:' + inputBorder + ';margin:0 6px;transition:background .3s}',
      '.df-progress-line.active{background:' + green + '}',
      '.df-title{font-size:1.15rem;font-weight:600;line-height:1.35;margin-bottom:.3rem;color:' + ink + ';font-family:Fraunces,serif;letter-spacing:-.01em}',
      '.df-sub{font-size:.82rem;color:' + inkSoft + ';margin-bottom:1.75rem;line-height:1.6;font-family:Inter,system-ui,sans-serif}',
      '.df-field{margin-bottom:1.25rem}',
      '.df-label{display:block;font-size:.72rem;font-weight:500;color:' + inkSoft + ';margin-bottom:.4rem;font-family:Inter,system-ui,sans-serif;letter-spacing:.01em}',
      '.df-input{width:100%;padding:.8rem 1rem;border-radius:.625rem;border:1.5px solid ' + inputBorder + ';background:' + inputBg + ';color:' + ink + ';font-size:.88rem;outline:none;transition:border .25s,box-shadow .25s,background .25s;font-family:Inter,system-ui,sans-serif;box-sizing:border-box}',
      '.df-input:focus{border-color:' + green + ';box-shadow:0 0 0 3px rgba(10,123,62,.1);background:' + (isDark ? 'rgba(255,255,255,0.07)' : '#fff') + '}',
      '.df-input::placeholder{color:' + (isDark ? 'rgba(255,255,255,0.25)' : '#9ca3af') + '}',
      '.df-range-wrap{padding:.75rem 0 .25rem}',
      '.df-range{-webkit-appearance:none;width:100%;height:4px;border-radius:99px;background:' + (isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb') + ';outline:none;cursor:pointer}',
      '.df-range::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;background:#fff;border:3px solid ' + green + ';cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.12),0 0 0 4px rgba(10,123,62,.08)}',
      '.df-range::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:#fff;border:3px solid ' + green + ';cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.12)}',
      '.df-range-labels{display:flex;justify-content:space-between;align-items:baseline;margin-top:.6rem;font-size:.7rem;color:' + inkSoft + ';font-family:Inter,system-ui,sans-serif}',
      '.df-range-value{color:' + green + ';font-weight:700;font-size:1.2rem;font-variant-numeric:tabular-nums}',
      '.df-btn{display:flex;align-items:center;justify-content:center;gap:.6rem;width:100%;padding:1rem 1.5rem;border:none;border-radius:.625rem;background:' + green + ';color:#fff;font-size:.88rem;font-weight:600;cursor:pointer;transition:all .25s cubic-bezier(.4,0,.2,1);font-family:Inter,system-ui,sans-serif;margin-top:.5rem;box-shadow:0 1px 3px rgba(10,123,62,.2),0 4px 12px rgba(10,123,62,.12);letter-spacing:.01em}',
      '.df-btn:hover{background:#096832;box-shadow:0 2px 6px rgba(10,123,62,.25),0 8px 20px rgba(10,123,62,.15);transform:translateY(-1px)}',
      '.df-btn:active{transform:translateY(0);box-shadow:0 1px 2px rgba(10,123,62,.15)}',
      '.df-btn svg{flex-shrink:0}',
      '.df-badge{display:flex;align-items:center;justify-content:center;gap:.35rem;font-size:.68rem;color:' + inkSoft + ';margin-top:1rem;font-family:Inter,system-ui,sans-serif;opacity:.7}',
      '.df-proof{display:flex;align-items:center;justify-content:center;gap:.35rem;font-size:.72rem;color:' + (isDark ? 'rgba(255,255,255,0.45)' : '#6b7280') + ';margin-top:.75rem;font-family:Inter,system-ui,sans-serif}',
      '.df-proof svg{flex-shrink:0;color:' + green + '}',
      '.df-success{text-align:center;padding:2.5rem 1rem}',
      '.df-success-icon{width:56px;height:56px;border-radius:50%;background:rgba(10,123,62,.1);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem}',
      '.df-success-title{font-size:1.15rem;font-weight:600;color:' + ink + ';margin-bottom:.35rem;font-family:Fraunces,serif}',
      '.df-success-sub{font-size:.82rem;color:' + inkSoft + ';font-family:Inter,system-ui,sans-serif;line-height:1.5}',
      '@keyframes df-fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
      '.df-animate{animation:df-fadeIn .3s ease-out}',
      '@media(max-width:480px){.df-box{padding:1.5rem 1.25rem;border-radius:1rem}.df-title{font-size:1.05rem}.df-progress-dot{width:24px;height:24px;font-size:.6rem}}'
    ].join('\n');
    var el = document.createElement('style');
    el.id = 'df-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ── RENDER ── */
  function render(container, personaId) {
    var cfg = PERSONAS[personaId];
    if (!cfg) { container.innerHTML = '<p style="color:red">Persona "' + personaId + '" não configurada.</p>'; return; }

    injectStyles(cfg.theme);
    var state = { step: 0, data: {}, started: false };

    function draw() {
      var s = cfg.steps[state.step];
      var isLast = state.step === cfg.steps.length - 1;
      var h = '';

      // Progress bar — numbered steps
      if (cfg.steps.length > 1) {
        h += '<div class="df-progress">';
        for (var p = 0; p < cfg.steps.length; p++) {
          var dotClass = p < state.step ? 'done' : (p === state.step ? 'active' : '');
          var lineClass = p < state.step ? 'active' : '';
          h += '<div class="df-progress-dot ' + dotClass + '"><span>' + (p + 1) + '</span></div>';
          if (p < cfg.steps.length - 1) h += '<div class="df-progress-line ' + lineClass + '"></div>';
        }
        h += '</div>';
      }

      h += '<h3 class="df-title">' + s.title + '</h3>';
      if (s.sub) h += '<p class="df-sub">' + s.sub + '</p>';
      h += '<form id="df-form" autocomplete="off">';

      for (var f = 0; f < s.fields.length; f++) {
        var fld = s.fields[f];
        h += '<div class="df-field">';
        h += '<label class="df-label" for="df-' + fld.id + '">' + fld.label + '</label>';

        if (fld.type === 'range') {
          var val = state.data[fld.id] || fld.def;
          h += '<div class="df-range-wrap">';
          h += '<input type="range" class="df-range" id="df-' + fld.id + '" min="' + fld.min + '" max="' + fld.max + '" step="' + fld.step + '" value="' + val + '">';
          h += '<div class="df-range-labels">';
          h += '<span>R$ ' + fmtCurrency(fld.min) + '</span>';
          h += '<span class="df-range-value" id="df-rv-' + fld.id + '">R$ ' + fmtCurrency(val) + '/mês</span>';
          h += '<span>R$ ' + fmtCurrency(fld.max) + '</span>';
          h += '</div></div>';
        } else {
          h += '<input class="df-input" type="' + fld.type + '" id="df-' + fld.id + '"';
          if (fld.ph) h += ' placeholder="' + fld.ph + '"';
          if (fld.req) h += ' required';
          if (state.data[fld.id]) h += ' value="' + state.data[fld.id].replace(/"/g, '&quot;') + '"';
          h += '>';
        }
        h += '</div>';
      }

      h += '<button type="submit" class="df-btn">';
      if (isLast) h += '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
      h += s.cta + '</button>';
      h += '</form>';

      h += '<div class="df-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> ' + (cfg.badge || 'Dados protegidos.') + '</div>';
      if (cfg.proof && state.step === 0) h += '<div class="df-proof"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg> ' + cfg.proof + '</div>';

      container.querySelector('.df-box').innerHTML = h;
      container.querySelector('.df-box').classList.add('df-animate');

      // Bind events
      var form = document.getElementById('df-form');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Collect field data
        for (var fi = 0; fi < s.fields.length; fi++) {
          var fid = s.fields[fi].id;
          var el = document.getElementById('df-' + fid);
          if (el) state.data[fid] = el.value;
        }

        if (!state.started) {
          state.started = true;
          track('form_start', { persona: personaId, tier: cfg.tier });
        }
        track('cta_click', { persona: personaId, step: state.step + 1, cta: s.cta });

        if (!isLast) {
          state.step++;
          draw();
          container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          submitForm(container, cfg, state.data, personaId);
        }
      });

      // Range live update
      var ranges = container.querySelectorAll('.df-range');
      for (var ri = 0; ri < ranges.length; ri++) {
        (function(rng) {
          rng.addEventListener('input', function () {
            state.data[rng.id.replace('df-', '')] = rng.value;
            var rv = document.getElementById('df-rv-' + rng.id.replace('df-', ''));
            if (rv) rv.textContent = 'R$ ' + fmtCurrency(parseInt(rng.value)) + '/mês';
          });
        })(ranges[ri]);
      }

      // Phone mask
      var phoneInput = document.getElementById('df-whatsapp');
      if (phoneInput) {
        phoneInput.addEventListener('input', function () {
          this.value = maskPhone(this.value);
        });
      }
    }

    // Initial structure
    var isDark = cfg.theme === 'dark';
    container.className = 'df-section';
    container.style.background = isDark ? '#0a0e0a' : '#f5f4f0';
    container.innerHTML = '<div class="df-wrap"><p class="df-kicker">● SIMULAÇÃO PERSONALIZADA</p><h2 class="df-section-title">Dê o primeiro passo para a sua <span class="df-grad">conquista.</span></h2><div class="df-box df-animate"></div></div>';

    draw();
  }

  /* ── SUBMIT ── */
  function submitForm(container, cfg, data, personaId) {
    var ids = captureIdentifiers();
    track('form_submit', { persona: personaId, tier: cfg.tier, has_email: !!data.email, ref: ids.ref });
    track('conversion', { persona: personaId, tier: cfg.tier, ref: ids.ref });

    // Fire Google Ads conversion
    try {
      if (window.gtag) window.gtag('event', 'conversion', { 'send_to': 'AW-18248652606/kTjGCO35_r0cELK2ivND' });
      if (window.fbq) window.fbq('track', 'Lead');
    } catch (e) { /* silent */ }

    // Send to Google Sheets via API — enriched with identifiers
    var payload = {
      name: data.nome || '',
      email: data.email || '',
      phone: data.whatsapp || '',
      segment: personaId,
      credit: data.parcela || data.bem_desejado || '',
      months: 0,
      plan: 'LP-' + personaId,
      origin: window.location.href,
      ref: ids.ref,
      fbc: ids.fbc,
      fbp: ids.fbp,
      gclid: ids.gclid,
      utm_source: ids.utm_source,
      utm_medium: ids.utm_medium,
      utm_campaign: ids.utm_campaign,
      utm_content: ids.utm_content,
      lp: ids.lp
    };

    fetch(LEADS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function () { /* silent */ });

    // Build WhatsApp message with ref for traceability
    var msg = cfg.wa
      .replace('{bem}', data.bem_desejado || 'consórcio')
      .replace('{parcela}', data.parcela ? fmtCurrency(parseInt(data.parcela)) : 'A combinar')
      + '\n\nRef: ' + ids.ref;

    var waUrl = 'https://api.whatsapp.com/send?phone=' + WA_NUMBER + '&text=' + encodeURIComponent(msg);

    // Show success + redirect
    var box = container.querySelector('.df-box');
    box.innerHTML = '<div class="df-success df-animate"><div class="df-success-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A7B3E" stroke-width="2" stroke-linecap="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg></div><div class="df-success-title">Proposta enviada!</div><div class="df-success-sub">Abrindo o WhatsApp em instantes...</div></div>';

    setTimeout(function () {
      var win = window.open(waUrl, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = waUrl;
      }
    }, 800);
  }

  /* ── INIT ── */
  function init() {
    var containers = document.querySelectorAll('[data-dream-form]');
    for (var i = 0; i < containers.length; i++) {
      var persona = containers[i].getAttribute('data-dream-form');
      if (persona && PERSONAS[persona]) {
        render(containers[i], persona);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
