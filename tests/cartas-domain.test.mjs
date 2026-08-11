import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizarSegmento,
  normalizarTexto,
  rotuloSegmento,
} from "../src/features/cartas/domain/segmento.ts";

test("normaliza acentos, caixa e espaços", () => {
  assert.equal(normalizarTexto("  ImÓVEIS  "), "imoveis");
});

test("converte aliases históricos para segmentos canônicos", () => {
  const casos = new Map([
    ["Imóvel", "imoveis"],
    ["Imobiliário", "imoveis"],
    ["Apartamentos", "imoveis"],
    ["Automotivo & Frotas", "veiculos"],
    ["Caminhões", "veiculos"],
    ["Agrícola", "agro"],
    ["Máquinas pesadas", "agro"],
    ["Crédito livre", "outros"],
  ]);

  for (const [entrada, esperado] of casos) {
    assert.equal(normalizarSegmento(entrada), esperado, entrada);
  }
});

test("retorna rótulos consistentes para a interface", () => {
  assert.equal(rotuloSegmento("imobiliario"), "Imóveis");
  assert.equal(rotuloSegmento("automotivo"), "Veículos");
  assert.equal(rotuloSegmento("agrícola"), "Agro");
  assert.equal(rotuloSegmento("desconhecido"), "Outros");
});
