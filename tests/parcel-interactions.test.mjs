import assert from 'node:assert/strict';
import test from 'node:test';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';
import { createLoader } from './helpers/load-typescript.mjs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.test/?gclid=test-google' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.sessionStorage = dom.window.sessionStorage;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import('react-dom/client');
const Simulator = createLoader()('src/components/ParcelSimulator.tsx').default;

async function mount(props) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(React.createElement(Simulator, props)));
  return { container, close: async () => { await act(async () => root.unmount()); container.remove(); } };
}

async function fill(input, value) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  });
}

async function submitContact(container) {
  await fill(container.querySelector('[placeholder="Seu Nome Completo"]'), 'Ana Teste');
  await fill(container.querySelector('[placeholder="WhatsApp / Celular com DDD"]'), '45999999999');
  await act(async () => container.querySelector('[type="checkbox"]').click());
  const link = container.querySelector('a[href*="wa.me"]');
  link.addEventListener('click', (event) => event.preventDefault());
  await act(async () => link.click());
}

test('envio da home mantém identificação e envia prazo numérico e atribuição', async () => {
  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => { requests.push({ url, body: JSON.parse(options.body) }); return new Response('{}'); };
  sessionStorage.setItem('tf_ids', JSON.stringify({ ref: 'tf_teste', fbc: 'fbc_teste', fbp: 'fbp_teste', gclid: 'gclid_teste', utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'teste', utm_content: 'anuncio' }));
  const view = await mount({});
  try {
    await submitContact(view.container);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, '/api/leads/');
    const { body } = requests[0];
    assert.equal(body.months, 180);
    assert.equal(body.credit, '500000');
    assert.equal(body.ref, 'tf_teste');
    assert.equal(body.lp, 'home-simulador');
    assert.equal(body.origin, window.location.href);
    for (const key of ['fbc', 'fbp', 'gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) assert.ok(body[key], key);
  } finally { await view.close(); globalThis.fetch = originalFetch; }
});

test('token impede envio a leads mesmo se os campos de contato estiverem visíveis', async () => {
  let requests = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { requests++; return new Response('{}'); };
  const view = await mount({ prospectToken: 'abcdefghijklmnopqrstuv' });
  try { await submitContact(view.container); assert.equal(requests, 0); }
  finally { await view.close(); globalThis.fetch = originalFetch; }
});

test('callback acompanha plano e informa prazo efetivo e parcela do Conforto', async () => {
  const values = [];
  const view = await mount({ initialSegment: 'veiculo', initialCredit: 200000, initialMonths: 80, hideContactFields: true, onValuesChange: (value) => values.push(value) });
  try {
    assert.equal(values.at(-1)?.months, 80);
    const button = [...view.container.querySelectorAll('button')].find((element) => element.textContent.includes('Plano Conforto'));
    await act(async () => button.click());
    assert.equal(values.at(-1).plan, 'conforto');
    assert.equal(values.at(-1).months, 92);
    assert.ok(Math.abs(values.at(-1).installment - 236000 / 92) < 0.001);
  } finally { await view.close(); }
});
