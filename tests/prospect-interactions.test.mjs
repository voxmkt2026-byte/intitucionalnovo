import assert from 'node:assert/strict';
import test from 'node:test';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';
import { createLoader } from './helpers/load-typescript.mjs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.test/s/abcdefghijklmnopqrstuv/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.sessionStorage = dom.window.sessionStorage;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import('react-dom/client');
const load = createLoader();
const prospect = { token: 'abcdefghijklmnopqrstuv', empresa: 'Empresa Teste', contato_nome: 'Ana', segmento: 'veiculo', credito: 200000, prazo_meses: 80, plano: 'titanium', whatsapp_consultor: '5545999999999', consultor_nome: 'Eduardo' };
const values = { segment: 'veiculo', credit: 200000, months: 80, plan: 'titanium', installment: 2850 };
const buttonProps = { token: prospect.token, empresa: prospect.empresa, whatsappNumber: prospect.whatsapp_consultor, consultorNome: 'Eduardo', values };

async function mount(Component, props) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(React.createElement(Component, props)));
  return { container, close: async () => { await act(async () => root.unmount()); container.remove(); } };
}

async function fill(input, value) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  });
}

test('WhatsApp tem mensagem atual e código curto; falha de log não bloqueia link', async () => {
  const Button = load('src/components/prospect/WhatsAppProspectButton.tsx').default;
  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (...args) => { requests.push(args); throw new Error('offline'); };
  const view = await mount(Button, buttonProps);
  try {
    const link = view.container.querySelector('a');
    const url = new URL(link.href);
    assert.equal(url.pathname, '/5545999999999');
    assert.match(url.searchParams.get('text'), /Empresa Teste.*Veículo.*200\.000,00.*80x.*Titanium.*Código: ABCDEFGH/);
    assert.ok(!url.searchParams.get('text').includes(prospect.token));
    assert.equal(link.target, '_blank');
    let blocked = true;
    link.addEventListener('click', (event) => { blocked = event.defaultPrevented; event.preventDefault(); });
    await act(async () => link.click());
    assert.equal(blocked, false);
    assert.equal(requests[0][0], `/api/prospects/${prospect.token}/evento/`);
    assert.equal(requests[0][1].keepalive, true);
    assert.equal(JSON.parse(requests[0][1].body).tipo, 'whatsapp_click');
  } finally { await view.close(); globalThis.fetch = originalFetch; }
});

test('formulário envia contato pré-preenchido e substitui formulário por confirmação', async () => {
  const Form = load('src/components/prospect/ContatoProspectForm.tsx').default;
  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => { requests.push([url, JSON.parse(options.body)]); return Response.json({ status: 'ok' }); };
  const view = await mount(Form, { token: prospect.token, contatoNome: 'Ana', consultorNome: 'Eduardo' });
  try {
    assert.equal(view.container.querySelector('[name="nome"]').value, 'Ana');
    await fill(view.container.querySelector('[name="telefone"]'), '45999999999');
    await act(async () => view.container.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })));
    assert.equal(requests[0][0], `/api/prospects/${prospect.token}/contato/`);
    assert.equal(requests[0][1].telefone.replace(/\D/g, ''), '45999999999');
    assert.match(view.container.textContent, /Pronto\. Eduardo entra em contato/);
    assert.equal(view.container.querySelector('form'), null);
  } finally { await view.close(); globalThis.fetch = originalFetch; }
});

test('formulário mostra alternativa WhatsApp quando a API falha', async () => {
  const Form = load('src/components/prospect/ContatoProspectForm.tsx').default;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{}', { status: 500 });
  const view = await mount(Form, { token: prospect.token, contatoNome: 'Ana', consultorNome: 'Eduardo', whatsappAction: React.createElement('a', { href: 'https://wa.me/5545999999999' }, 'WhatsApp') });
  try {
    await fill(view.container.querySelector('[name="telefone"]'), '45999999999');
    await act(async () => view.container.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })));
    assert.match(view.container.textContent, /Não conseguimos enviar agora/);
    assert.ok(view.container.querySelector('a[href*="wa.me"]'));
  } finally { await view.close(); globalThis.fetch = originalFetch; }
});

test('cartas vazias/erro não deixam bloco e filtro usa segmento e faixa corretos', async () => {
  const Cards = load('src/components/prospect/CartasSugeridas.tsx').default;
  const originalFetch = globalThis.fetch;
  const urls = [];
  globalThis.fetch = async (url) => { urls.push(url); return Response.json({ data: [] }); };
  const view = await mount(Cards, { segmento: 'veiculo', credito: 200000 });
  try {
    assert.equal(view.container.innerHTML, '');
    const url = new URL(urls[0], 'https://example.test');
    assert.equal(url.pathname, '/api/cartas/');
    assert.equal(url.searchParams.get('segmento'), 'veiculos');
    assert.equal(url.searchParams.get('valor_min'), '140000');
    assert.equal(url.searchParams.get('valor_max'), '260000');
    assert.equal(url.searchParams.get('limit'), '3');
  } finally { await view.close(); globalThis.fetch = originalFetch; }
});

test('cliente não registra recálculo inicial e agrupa mudanças em 1,5 segundos', async () => {
  const Client = load('src/app/s/[token]/ProspectSimulatorClient.tsx').default;
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => { requests.push([url, options]); return Response.json({ data: [] }); };
  const view = await mount(Client, { prospect });
  try {
    await act(async () => new Promise((resolve) => setTimeout(resolve, 1550)));
    assert.equal(requests.filter(([, options]) => options?.method === 'POST').length, 0);
    await fill(view.container.querySelector('input[type="range"]'), '210000');
    await fill(view.container.querySelector('input[type="range"]'), '220000');
    await act(async () => new Promise((resolve) => setTimeout(resolve, 1550)));
    const events = requests.filter(([, options]) => options?.method === 'POST');
    assert.equal(events.length, 1);
    assert.equal(JSON.parse(events[0][1].body).payload.credito, 220000);
    assert.equal(JSON.parse(events[0][1].body).tipo, 'recalculo');
    assert.ok(!requests.some(([url]) => url === '/api/leads/'));
  } finally { await view.close(); globalThis.fetch = originalFetch; }
});
