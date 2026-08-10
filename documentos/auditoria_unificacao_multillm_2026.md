# Auditoria e plano de unificação do ecossistema Titanium

Data da auditoria: 10/08/2026  
Escopo: `C:\Users\callo\Documents\intitucionalnovo`  
Objetivo: refinar site institucional, landing pages, CRMs, portais e dashboards para um padrão único, seguro, responsivo e verificável.

## Resumo executivo

O sistema já possui uma base funcional ampla, mas hoje opera como três famílias visuais e técnicas parcialmente separadas:

1. aplicação institucional em Next.js;
2. 17 landing pages estáticas em `public/`;
3. áreas autenticadas de administrador e colaborador.

Os problemas vistos nas capturas não são isolados. Eles vêm de contratos ausentes entre navegação, modais, autenticação, dados e filtros. As correções mais urgentes são:

- separar layouts públicos e protegidos, removendo menus das telas de login;
- instituir uma escala única de camadas para que modal, drawer e filtros sempre cubram a navegação;
- unificar a consulta e a classificação das cartas, garantindo a mesma fonte de dados na vitrine pública e no portal do colaborador;
- trocar comparação literal de segmento por um valor canônico (`imoveis`, `veiculos`, `agro`);
- consolidar tokens, componentes, responsividade, movimento e testes em um design system Titanium;
- eliminar os 174 erros de lint antes de ampliar o front-end.

Nenhuma credencial foi alterada nesta auditoria. A senha de um colaborador não deve ser registrada em código ou documentação; a troca deve ocorrer por um token temporário, de uso único, enviado ao e-mail validado.

## Skills aplicadas

| Skill | Papel na auditoria | Aplicação planejada |
|---|---|---|
| `frontend-design` | direção visual intencional | hierarquia, assinatura visual Titanium e componentes compartilhados |
| `ui-ux-pro-max` | heurísticas de UX e acessibilidade | estados, foco, contraste, toque, formulários e responsividade |
| `gsap-core` | animações básicas | tokens de duração/easing e animações somente em `transform`/`opacity` |
| `gsap-timeline` | sequências coordenadas | heros e narrativas com uma timeline proprietária por sequência |
| `gsap-scrolltrigger` | animações ligadas ao scroll | gatilhos responsivos, cleanup e respeito a movimento reduzido |
| `scroll-experience` | experiência de rolagem | progressão sem bloquear scroll nativo e fallback móvel |
| `threejs-webgl` | cenas WebGL | orçamento de GPU, descarte de recursos, DPR limitado e fallback estático |
| `web3d-integration-patterns` | integração 3D + React + GSAP | propriedade única de cada transformação e lifecycle previsível |

## Evidências técnicas verificadas

- Next.js `16.2.9`, React `19.2.4` e Tailwind CSS 4.
- 18 rotas `page.tsx` e 17 landing pages estáticas com `index.html`.
- `npx tsc --noEmit`: aprovado.
- `npm run lint`: reprovado com 219 ocorrências — 174 erros e 45 avisos.
- O script `build` executa `scripts/migrate.mjs` antes do `next build`; por segurança, o build não foi executado durante a auditoria.
- O portal do colaborador consulta cartas disponíveis no banco, mas aplica filtro local por igualdade textual.
- O catálogo público consulta `/api/cartas` com paginação, criando dois caminhos diferentes para o mesmo domínio.

## Achados e correções

### P0 — corrigir antes de novos refinamentos visuais

| Problema | Evidência | Correção recomendada | Critério de aceite |
|---|---|---|---|
| Menu invade filtros, modais e pop-ups | navegação pública usa camada equivalente/superior aos componentes `z-50`; o CSS estático usa `z-index: 100` | criar tokens globais de camada e um `OverlayProvider` com portal, backdrop e controle de navegação | todo modal cobre integralmente o menu; `Esc` fecha; foco não sai do diálogo; scroll do corpo é bloqueado |
| Menu do admin aparece antes do login | `src/app/admin/layout.tsx` renderiza `AdminNavbar` para todas as rotas | usar route groups sem mudar URL: `admin/(public)/login` e `admin/(protected)`; navbar somente no layout protegido | `/admin/login` não contém menu; ele aparece após sessão válida |
| Menu institucional aparece no login do colaborador | ramo não autenticado de `src/app/colaboradores/portal/page.tsx` renderiza `Navbar` e `Footer` | criar shell de autenticação dedicado, sem navegação comercial | login do portal exibe somente marca, formulário e suporte necessário |
| Apenas “Todos” funciona em Oportunidades | `PortalDashboard.tsx` compara `segmento` com o rótulo usando igualdade exata | normalizar na fronteira do sistema e filtrar por enum canônico; migrar aliases e acentos existentes | Todos, Imóveis, Veículos e Agro retornam os conjuntos esperados em desktop e mobile |
| Vitrine pública e portal podem divergir | público usa API paginada; portal faz consulta direta e filtro próprio | criar `CartaDTO`, repositório/serviço e contrato de filtros compartilhados; manter paginação como opção de apresentação | toda carta disponível no catálogo público também é consultável/reservável pelo colaborador, sem duplicatas |

### P1 — estabilidade, segurança e qualidade

| Problema | Evidência | Correção recomendada | Critério de aceite |
|---|---|---|---|
| Fluxo de senha existe, mas precisa de prova ponta a ponta | há solicitação e redefinição por e-mail, hash e rate limit; depende de Resend e configuração externa | validar variáveis por ambiente, expiração, uso único, invalidação de sessões e resposta genérica contra enumeração | teste E2E cobre solicitação, e-mail, token expirado/usado, nova senha e invalidação da antiga |
| CPF/CNPJ mistura autenticação e cadastro legal | login do colaborador já é e-mail/senha, mas PII continua em cadastros de negócio | manter autenticação somente com e-mail/senha; coletar CPF/CNPJ apenas após login e apenas no fluxo legal que o exige | tela de login não pede CPF; PII tem finalidade, retenção e autorização documentadas |
| Dívida de React/TypeScript | lint acusa `any`, atualização de estado em efeitos, impureza com `Date.now`, links internos e código não utilizado | eliminar por domínio; começar por autenticação, cartas e overlays; não mascarar regras | ESLint com zero erro; TypeScript continua aprovado |
| Build altera banco | `build` encadeia migração de banco | separar `build` e `db:migrate`; executar migração em etapa explícita do deploy | build de CI é repetível e não realiza escrita no banco |
| Modais não formam um primitive acessível | implementações independentes em filtros, cartas, admin e portal | componente compartilhado com `role="dialog"`, `aria-modal`, título associado, focus trap, foco restaurado e portal | testes de teclado e leitor de tela aprovados |
| Reserva precisa de contrato transacional | várias vitrines podem disputar a mesma carta | reservar no servidor com transação/lock, autorização, idempotência e auditoria | duas solicitações simultâneas não reservam a mesma carta |

### P2 — unificação visual, performance e evolução

| Problema | Evidência | Correção recomendada | Critério de aceite |
|---|---|---|---|
| Tokens e shells fragmentados | CSS inline do admin, Tailwind na aplicação e `style-master.css` nas LPs | criar fonte única de tokens CSS e primitives compartilhados; LPs consomem versão compilada | cor, tipo, raio, sombra, espaço e camada têm o mesmo nome e valor em todos os produtos |
| Landing pages divergem com o tempo | 17 pastas estáticas replicam estrutura e comportamento | adotar template orientado por dados/segmento; migrar em ondas e preservar URLs/SEO | alterações de header, formulário e consentimento são feitas uma vez |
| WebGL roda continuamente | `Beams.tsx` usa `frameloop="always"` e DPR até 2 | pausar fora da viewport/aba, reduzir DPR móvel, respeitar `prefers-reduced-motion` e oferecer fallback estático | sem animação contínua em aba invisível; orçamento de frame e memória definido |
| Movimento sem contrato global | componentes possuem estratégias diferentes | motion tokens, `gsap.context()`/cleanup, `matchMedia`, propriedade única por transformação e nenhuma rolagem sequestrada | movimento reduzido funciona; nenhuma duplicação após navegação; 60 fps no aparelho de referência |
| Falta regressão visual e E2E integrada | falhas atuais aparecem apenas em uso manual | Playwright por fluxo e screenshots em 375, 768, 1024 e 1440 px | pipeline bloqueia regressão de login, overlay, filtros e reserva |

## Arquitetura-alvo

Evitar uma reescrita total. A unificação deve acontecer por camadas dentro do repositório atual:

```text
src/
  design-system/
    tokens.css
    primitives/       # Button, Input, Dialog, Drawer, Tabs, Badge
    motion/           # durations, easings, reduced-motion, GSAP helpers
  components/
    shells/           # PublicShell, AuthShell, AdminShell, PortalShell
  features/
    cartas/
      domain/         # tipos, segmentos canônicos e regras
      data/           # repositório, DTO e queries
      ui/             # filtros, tabela, card e reserva
public/
  shared/             # saída compilada dos tokens/primitives das LPs
```

### Contrato visual Titanium

- uma família tipográfica e papéis semânticos: display, heading, body, label e data;
- espaçamento em grade de 8 px, com exceções explícitas de 4 px;
- alvo de toque mínimo de 44 × 44 px;
- estados completos: default, hover, focus-visible, active, disabled, loading, empty, error e success;
- contraste WCAG AA e foco sempre visível;
- camadas sem números avulsos: `base 0`, `sticky 20`, `nav 30`, `dropdown 40`, `backdrop 80`, `modal/drawer 90`, `toast/consent 100`;
- overlays tornam o restante da página inerte; em fluxos de autenticação, o shell não monta a navegação;
- breakpoints validados em 375, 768, 1024 e 1440 px, além de zoom a 200%;
- uma única assinatura visual forte por página, preservando legibilidade e velocidade.

### Contrato de cartas

```ts
type CartaSegmento = 'imoveis' | 'veiculos' | 'agro'

type CartaDTO = {
  id: string
  administradora: string
  credito: number
  entrada: number
  segmento: CartaSegmento
  disponivel: boolean
  reservavel: boolean
}
```

Aliases como `Imóvel`, `imóveis`, `automotivo`, `veículos`, `agrícola` e `agro` devem ser transformados no servidor antes de chegar à UI. Depois da limpeza do banco, uma constraint impede novos valores livres.

## Plano de implementação

As estimativas abaixo consideram uma pessoa desenvolvedora sênior e devem ser recalibradas após a Fase 0.

| Fase | Duração | Entregas |
|---|---:|---|
| 0. Baseline e segurança | 1–2 dias | branch, backup/migração reversível, inventário visual, fixtures de cartas, separar build de migração, testes sentinela |
| 1. Autenticação, shells e overlays | 2–4 dias | route groups do admin, `AuthShell`, `Dialog/Drawer`, escala de camadas, remoção dos menus nos logins |
| 2. Domínio de cartas | 3–5 dias | enum/normalização, DTO/repositório único, filtros completos, paridade das vitrines, reserva transacional |
| 3. Fundação do design system | 3–5 dias | tokens, tipografia, primitives, estados, Storybook ou catálogo interno e regras de acessibilidade |
| 4. CRM, admin e portal | 5–8 dias | migração dos dashboards e tabelas, responsividade, vazios/erros/loading e remoção do CSS duplicado |
| 5. Site e LPs em ondas | 6–10 dias | template comum; onda piloto com 2 LPs; depois segmentos de veículos, imóveis e demais páginas |
| 6. Motion e 3D | 3–5 dias | motion tokens, timelines, ScrollTrigger progressivo, budget WebGL e fallback reduzido/móvel |
| 7. QA e liberação | 3–5 dias | E2E, visual regression, Lighthouse, acessibilidade, observabilidade e rollout gradual |

Estimativa inicial total: **23–39 dias de engenharia**. O trabalho pode ser entregue por fatias verticais; P0 deve ir à produção antes da migração completa das LPs.

## Ordem recomendada do backlog

1. Testes que reproduzem menu sobre modal, menu pré-login e filtros quebrados.
2. Layout público/protegido do admin e shell limpo do colaborador.
3. Primitive de overlay e escala central de camadas.
4. Segmentos canônicos e migração dos dados existentes.
5. Fonte única das cartas e reserva transacional.
6. Corrigir lint nos arquivos tocados e estabelecer orçamento de zero novos erros.
7. Design tokens e primitives.
8. Migrar portal/admin; depois institucional e LPs em ondas.
9. Adicionar movimento e 3D somente após estabilidade, acessibilidade e performance.

## Matriz mínima de validação

- visitante abre `/admin/login`: nenhum menu de administrador é montado;
- colaborador abre `/colaboradores/portal` sem sessão: nenhum menu institucional é montado;
- modal de filtros aberto: menu invisível/inativo, foco preso, `Esc` fecha e foco retorna ao disparador;
- Todos, Imóveis, Veículos e Agro funcionam com acentos, caixa e aliases históricos;
- cada carta pública disponível aparece na consulta do portal e pode ser reservada uma única vez;
- redefinição retorna mensagem neutra, token expira, só funciona uma vez e invalida a senha anterior;
- teclado, leitor de tela, zoom 200% e movimento reduzido passam;
- larguras 375/768/1024/1440 não apresentam overflow horizontal;
- TypeScript, ESLint, testes unitários, E2E e regressão visual passam no CI;
- `next build` não acessa nem modifica o banco.

## Execução coordenada em três LLMs

As três IAs devem trabalhar com a mesma especificação, mas em branches e arquivos de responsabilidade diferentes. Não permitir que duas IAs editem simultaneamente o mesmo domínio.

| IA | Responsabilidade sugerida | Branch |
|---|---|---|
| Codex | domínio de cartas, APIs, testes e integração | `codex/cartas-unificadas` |
| Claude Code | autenticação, route groups, overlays e acessibilidade | `claude/auth-overlays` |
| Antigravity | tokens, catálogo visual, LP piloto e regressão visual | `antigravity/design-system` |

Protocolo:

1. cada IA lê `AGENTS.md`, este documento e as oito skills;
2. começa por um teste que reproduza o problema;
3. registra arquivos alterados, decisões, comandos e riscos;
4. não altera schema ou contrato compartilhado sem atualizar a especificação;
5. outra IA revisa o diff antes do merge;
6. integração ocorre na ordem: fundação compartilhada → autenticação/overlay → cartas → superfícies visuais;
7. o merge só acontece com a matriz mínima de validação aprovada.

Prompt-base para cada IA:

```text
Leia AGENTS.md, documentos/auditoria_unificacao_multillm_2026.md e as skills
frontend-design, ui-ux-pro-max, gsap-core, gsap-timeline, gsap-scrolltrigger,
threejs-webgl, scroll-experience e web3d-integration-patterns. Trabalhe apenas
no domínio que lhe foi atribuído. Preserve URLs e alterações existentes.
Primeiro reproduza o defeito com teste; depois implemente a menor mudança segura.
Entregue: evidência anterior, arquivos alterados, testes executados, resultado,
riscos restantes e screenshots nas larguras definidas. Não faça deploy nem
altere credenciais.
```

## Instalação das skills nas três IAs

O instalador preserva outras skills e pode ser executado repetidamente:

```powershell
Set-Location 'C:\Users\callo\Documents\intitucionalnovo'
powershell -ExecutionPolicy Bypass -File .\scripts\install-design-skills.ps1 -Scope Both
```

Destinos usados:

- projeto Codex + Antigravity: `.agents/skills`;
- projeto Claude Code: `.claude/skills`;
- global Codex: `%USERPROFILE%\.agents\skills`;
- global Claude Code: `%USERPROFILE%\.claude\skills`;
- global Antigravity IDE: `%USERPROFILE%\.gemini\config\skills`;
- global Antigravity CLI: `%USERPROFILE%\.gemini\antigravity-cli\skills`.

Após instalar, reiniciar a sessão de cada IA ou usar `/skills` onde o comando estiver disponível. A instalação é apenas a disponibilização das instruções; a IA ainda precisa mencionar/selecionar as skills no início de cada tarefa.

## Decisão para iniciar

Começar pelas Fases 0–2. Elas corrigem os defeitos visíveis, reduzem o risco de segurança e criam o contrato de dados que todas as vitrines usarão. O refinamento visual amplo deve começar somente depois que login, overlays, filtros e reserva estiverem cobertos por testes.
