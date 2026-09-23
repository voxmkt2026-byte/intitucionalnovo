import assert from 'node:assert/strict';
import test from 'node:test';
import { createLoader } from './helpers/load-typescript.mjs';

const token = 'abcdefghijklmnopqrstuv';
const prospect = {
  id: 17, token, empresa: 'Empresa Teste', contato_nome: 'Ana', segmento: 'veiculo',
  credito: '200000', prazo_meses: 80, plano: 'titanium',
  whatsapp_consultor: '5545999999999', consultor_nome: 'Eduardo',
  expira_em: null, ativo: true, criado_em: new Date().toISOString(),
};

function context({ valid = true, limited = false, failEvents = false } = {}) {
  const queries = [];
  const events = [];
  const sql = async (strings, ...values) => {
    const text = strings.join('?');
    queries.push({ text, values });
    if (text.includes('FROM prospects')) return valid && values.includes(token) ? [prospect] : [];
    if (text.includes('FROM rate_limits')) return [{ count: limited ? 100 : 0 }];
    if (text.includes('INSERT INTO prospect_events')) {
      if (failEvents) throw new Error('offline');
      events.push(values);
    }
    return [];
  };
  process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
  const load = createLoader({ '@neondatabase/serverless': { neon: () => sql } });
  const post = async (route, body, raw = false) => load(`src/app/api/prospects/[token]/${route}/route.ts`).POST(
    new Request(`http://localhost/api/prospects/${token}/${route}/`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.1', 'user-agent': 'prospects-test' },
      body: raw ? body : JSON.stringify(body),
    }), { params: Promise.resolve({ token }) },
  );
  return { load, post, queries, events };
}

test('consulta parametrizada filtra ativo e expiração sem expor id no DTO', async () => {
  const { load, queries } = context();
  const repo = load('src/features/prospects/data/repository.ts');
  const result = await repo.buscarProspectPorToken(token);
  assert.equal(result.empresa, 'Empresa Teste');
  assert.equal(result.credito, 200000);
  assert.equal(Object.hasOwn(result, 'id'), false);
  assert.match(queries[0].text, /ativo\s*=\s*TRUE/i);
  assert.match(queries[0].text, /expira_em\s*>=\s*NOW\(\)/i);
  assert.ok(queries[0].values.includes(token));
});

test('token não encontrado retorna null', async () => {
  const { load } = context({ valid: false });
  assert.equal(await load('src/features/prospects/data/repository.ts').buscarProspectPorToken(token), null);
});

test('contato normaliza telefone e grava somente o evento esperado', async () => {
  const { post, events, queries } = context();
  const response = await post('contato', { nome: ' Ana ', telefone: '(45) 99999-9999', horario: 'Manhã' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
  assert.equal(events.length, 1);
  assert.equal(events[0][1], 'contato_form');
  assert.deepEqual(JSON.parse(events[0][2]), { nome: 'Ana', telefone: '45999999999', horario: 'Manhã' });
  assert.ok(queries.every(({ text }) => !/\b(?:leads|lead_clicks|lead_events)\b/.test(text)));
});

test('contato rejeita dados inválidos, JSON malformado e corpo acima de 2 KB', async () => {
  const { post, events } = context();
  for (const body of [ { nome: 'A', telefone: '123', horario: 'Noite' }, { nome: 'Ana', telefone: '45999999999', horario: 'Noite' } ]) {
    assert.equal((await post('contato', body)).status, 400);
  }
  assert.equal((await post('contato', '{', true)).status, 400);
  assert.equal((await post('contato', 'á'.repeat(1100), true)).status, 413);
  assert.equal(events.length, 0);
});

test('as duas rotas revalidam token e recusam limite excedido', async () => {
  const contact = { nome: 'Ana', telefone: '45999999999', horario: 'Qualquer horário' };
  const event = { tipo: 'whatsapp_click', payload: { credito: 200000 } };
  for (const [route, body] of [['contato', contact], ['evento', event]]) {
    assert.equal((await context({ valid: false }).post(route, body)).status, 404);
    assert.equal((await context({ limited: true }).post(route, body)).status, 429);
  }
});

test('evento aceita apenas recálculo/WhatsApp e payload de até 1 KB', async () => {
  const { post, events } = context();
  assert.equal((await post('evento', { tipo: 'abertura', payload: {} })).status, 400);
  assert.equal((await post('evento', { tipo: 'recalculo', payload: [] })).status, 400);
  assert.equal((await post('evento', { tipo: 'recalculo', payload: { texto: 'á'.repeat(520) } })).status, 413);
  assert.equal((await post('evento', { tipo: 'recalculo', payload: { credito: 200000 } })).status, 200);
  assert.equal(events.length, 1);
});

test('falha do registro de eventos não rejeita a ação', async () => {
  const { post } = context({ failEvents: true });
  const oldWarn = console.warn;
  const warnings = [];
  console.warn = (...args) => warnings.push(args);
  try {
    assert.equal((await post('evento', { tipo: 'whatsapp_click', payload: {} })).status, 200);
    assert.ok(warnings.length > 0);
  } finally { console.warn = oldWarn; }
});
