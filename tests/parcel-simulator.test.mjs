import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createLoader } from './helpers/load-typescript.mjs';

const Simulator = createLoader()('src/components/ParcelSimulator.tsx').default;
const render = (props = {}) => renderToStaticMarkup(React.createElement(Simulator, props));

test('o simulador sem props mantém exatamente o HTML anterior da home', () => {
  assert.equal(render(), readFileSync(new URL('./fixtures/parcel-simulator-default.html', import.meta.url), 'utf8'));
});

test('simulação de veículo aplica teto de crédito e prazo e oculta captação', () => {
  const html = render({ initialSegment: 'veiculo', initialCredit: 900000, initialMonths: 180, hideContactFields: true, prospectToken: 'abcdefghijklmnopqrstuv' });
  assert.match(html, /value="300000"/);
  assert.match(html, /value="100"/);
  assert.doesNotMatch(html, /Seu Nome Completo|Seu E-mail|WhatsApp \/ Celular|privacy-consent-sim|wa\.me/);
});

test('valores iniciais abaixo do piso são limitados sem alterar as faixas', () => {
  const html = render({ initialSegment: 'imovel', initialCredit: 1, initialMonths: 1, initialName: 'Ana', whatsappNumber: '5545999999999' });
  assert.match(html, /value="100000"/);
  assert.match(html, /value="60"/);
  assert.match(html, /value="Ana"/);
  assert.match(html, /wa\.me\/5545999999999/);
});
