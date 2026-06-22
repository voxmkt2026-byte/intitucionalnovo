# Contexto do Ecossistema Titanium — Memória Institucional

> Última atualização: 22/06/2026
> Fonte: 3 auditorias completas (institucional + LPs + estrutural)

---

## Score Atual do Ecossistema

| Dimensão | Score |
|----------|-------|
| Institucional (copy) | 8.3/10 |
| Landing Pages (copy) | 7.3/10 |
| Estrutura/Técnico | 6.7/10 |
| **GERAL** | **7.4/10** |

---

## Fixes Já Aplicados (36 total)

### Sprint A — Credibilidade
1. Stats reais: 2mi/R$307bi → 2000+/R$50M+/4 anos
2. Stats LPs padronizados
3. TrustLogos: "Parceiros" → "Administradoras parceiras"
4. Disclaimer "60% menores que o banco*"
5. Empresário logos corrigidos
6. Empresário footer: "veiculares" → "empresariais"

### Sprint B — Personalização
7. FAQ único por persona (14 LPs) + pergunta anti-golpe
8. Headlines reescritos: terrenos, carta-comum, carro-luxo
9. Form título personalizado: 14 variantes
10. Sticky CTA orientado a benefício em 14 LPs
11. Proof text Tier 3 forms

### Sprint C — CTAs Institucionais
12. PersonaGateway: 3 CTAs vagos → específicos
13. ValueProps #3: credenciais → proposta de valor
14. Hero CTA: "Ver segmentos" → "Ver categorias de crédito"

### Sprint D — Conversão
15. **Simulador sem data gate** — resultado ANTES de pedir dados pessoais
16. Hero kicker → "4 anos · +2.000 clientes · CNPJ ativo"
17. Footer copy reescrito + taxa 0,5%/mês
18. MissaoVisaoValores: buzzwords → valores concretos
19. Institucional CTA → outcome-focused
20. Disclaimer simulação com metodologia

### Sprint E — Social Proof Compliance-Safe
21. **Testimonials.tsx** (NOVO): 3 depoimentos sem foto/estrelas
22. **CaseStudy.tsx** (NOVO): case Wellington completo
23. Posicionamento estratégico na page.tsx

### Sprint F — LPs Polish
24. "sem juros" qualificado em 3 LPs
25. 2º testimonial em 4 LPs (uber, empresario, medico, carta-contemplada)
26-30. Estrelas removidas, nomes abreviados, frases agressivas suavizadas
31-36. Disclaimers legais em todas as LPs

---

## Issues Pendentes (26 total)

### 🔴 Críticos (5)
1. **5 LPs com estrelas ★★★★★**: aeronaves, placas-solares, maquinas-agricolas, terrenos-agricolas, terrenos-construcao
2. **5 LPs com nomes completos**: mesmas 5 LPs (Eduardo Prado, Sebastião Lima, etc.)
3. **HTML bug**: terrenos-agricolas FAQ — `R$50 mil a R</div>` tag quebrada
4. **Middleware inexistente**: proxy.ts é código morto, rate limiter não funciona
5. **3 libs animação + 2 libs WebGL**: bundle ~500KB+ desnecessário

### 🟡 Altos (10)
6. "Sem juros compostos" Hero slide 2 sem asterisco
7. "pagar 30% ao banco" Hero sem fonte
8. "NPS 87" About sem fonte/data
9. "R$200 mil em juros" PersonaGateway sem fonte
10. "R$500 mil paga R$1,2 milhão" ValueProps sem asterisco
11. "Investimento que só valoriza" Segments — misleading
12. "Crédito aprovado sem entrada" Segments sem disclaimer
13. Hero image preload errada no LP médico (hero-contemplada.webp)
14. Empresário Passo 02 sem descrição
15. Sem security headers (CSP, X-Frame-Options)

### 🟢 Médios (11)
16. Nav CTA genérico em todas 14 LPs
17. 9 LPs com apenas 1 testimonial (faltam 2º)
18. og:url faltando em 7+ LPs
19. Fontes inconsistentes (Plus Jakarta Sans vs Fraunces+Inter)
20. Sem CTAs após Testimonials e CaseStudy (leak de conversão)
21. hasCalculated inicia true (mostra resultado default)
22. Preços nos Segments sem disclaimer de premissas
23. Acessibilidade: sem skip-link, SVGs sem aria-hidden, contraste baixo
24. Footer e Segments usam `<img>` raw
25. Simulador posicionado antes da prova social
26. lastModified hardcoded no sitemap

---

## Padrões de Qualidade por Tipo

### LP que tira 9+/10
- uber: FAQ 100% personalizado, 2 testimonials sem estrelas, hero CTA específico, equation clara
- empresario: kicker B2B, FAQ PJ, 2 testimonials compliance-safe

### LP que tira 6-7/10 (padrão a evitar)
- aeronaves: 1 testimonial com estrelas + nome completo, "sem juros abusivos" vago
- terrenos-agricolas: bug HTML, 1 testimonial, estrelas, nome completo

### Componente que tira 9+/10
- CaseStudy.tsx: narrative com timeline, stats reais, disclaimer completo, nome abreviado
- ParcelSimulator.tsx: resultado sem data gate, CNPJ, Banco Central, LGPD, anti-golpe

### Componente que tira 7-8/10 (precisa melhorar)
- Segments.tsx: claims sem disclaimer, preços sem premissas, "só valoriza"
- Hero.tsx: "30% ao banco" sem fonte, "sem juros compostos" sem asterisco

---

## Decisões Arquiteturais Tomadas

| Decisão | Razão | Data |
|---------|-------|------|
| Testimonials sem fotos | Compliance Google Ads — fotos geradas são detectadas | Jun 2026 |
| Case Study em vez de Reviews | Google/Meta monitoram reviews fabricados | Jun 2026 |
| Simulador mostra resultado antes de dados | Reduz fricção, aumenta conversão | Jun 2026 |
| dream-form.js compartilhado | Single source para todos os forms das LPs | Jun 2026 |
| Fraunces + Inter | Design system consistente com identidade premium | Jun 2026 |
| YAML para FAQs personalizados | Inline no HTML, não precisa de API | Jun 2026 |

---

## Stack do Projeto

| Tech | Versão | Uso |
|------|--------|-----|
| Next.js | 16.2.9 | Institucional |
| React | 19.2.4 | Componentes |
| Tailwind | v4 | Styling |
| framer-motion | latest | Animações (MANTER, remover GSAP e gl-matrix) |
| three.js | 0.184.0 | InfiniteMenu (avaliar remoção) |
| Zod | 4.4.3 | Validação API |
| sharp | 0.35.1 | Otimização de imagens |
| Vercel | — | Deploy |
| Google Sheets | — | CRM via Apps Script |
