# Relatório de implementação e continuidade — auditoria Titanium

Atualizado em: 10/08/2026

## Resultado desta execução

Os itens críticos da auditoria para autenticação, camadas, catálogo de cartas, filtros e reserva foram implementados. O projeto compila em produção, passa no TypeScript, nos testes automatizados adicionados e no lint do conjunto crítico alterado.

Esta execução não foi publicada e nenhuma migração foi aplicada ao banco de produção.

## Itens concluídos

### Autenticação e shells

- [x] Admin separado em route groups públicos e protegidos.
- [x] `/admin/login` não monta a navegação administrativa.
- [x] Login do colaborador não monta `Navbar` nem `Footer` institucionais.
- [x] Login do colaborador usa somente e-mail e senha; CPF não é credencial.
- [x] Recuperação de senha continua por e-mail, com token de uso único e resposta neutra.
- [x] Redefinição de senha incrementa `sessao_versao` e invalida sessões anteriores.
- [x] Validação de sessão consulta versão e status atuais no banco.

### Menus, modais e acessibilidade

- [x] Escala global de camadas criada em `src/design-system/tokens.css`.
- [x] Navegações possuem o marcador `data-site-navigation`.
- [x] Navegações são ocultadas enquanto qualquer diálogo ou popup marcado está aberto.
- [x] Componente compartilhado `Dialog` criado com portal, `role=dialog`, `aria-modal`, Escape, foco inicial, armadilha de foco, restauração de foco e bloqueio de scroll.
- [x] Filtros, scripts, reserva, chat, formulários e confirmações críticas migrados para `Dialog`.
- [x] Aviso de cookies participa do contrato global de sobreposição.

### Cartas, filtros e oportunidades

- [x] Modelo canônico de segmento criado: `imoveis`, `veiculos`, `agro` e `outros`.
- [x] Normalização ignora acentos, caixa e aliases conhecidos, evitando comparação textual frágil.
- [x] Repositório único de cartas disponíveis criado em `src/features/cartas/data/repository.ts`.
- [x] Catálogo público e portal do colaborador usam a mesma origem de dados.
- [x] API pública recebeu paginação, ordenação por lista permitida e filtro canônico.
- [x] Vitrine do colaborador inclui Todos, Imóveis, Veículos, Agro e Outros.
- [x] Estado vazio explícito adicionado aos filtros.

### Reserva e concorrência

- [x] Endpoint autenticado de reserva criado em `src/app/api/colaboradores/cartas/[id]/reservar/route.ts`.
- [x] Reserva, indisponibilização da carta e criação do lead são executadas na mesma instrução transacional.
- [x] Restrição única por carta impede reserva duplicada concorrente.
- [x] Resposta `409` cobre carta já reservada ou indisponível.
- [x] CPF/CNPJ foi removido do formulário e da mensagem de reserva.

### Build, qualidade e movimento

- [x] `npm run build` deixou de executar migração implicitamente.
- [x] Migração ficou explícita em `npm run build:with-migrations`.
- [x] Scripts `typecheck` e `test` adicionados.
- [x] WebGL limita DPR, pausa fora da viewport/aba e respeita `prefers-reduced-motion`.
- [x] Tokens globais de foco, movimento e camadas adicionados.

## Evidências executadas

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | passou |
| `npm test` | 6 testes passaram |
| ESLint do conjunto crítico alterado | passou |
| `npm run build` | passou; 38/38 páginas geradas |
| `git diff --check` | passou; apenas avisos de conversão LF/CRLF |
| Browser em 375, 768, 1024 e 1440 px | sem overflow horizontal |
| Login admin nos quatro breakpoints | sem navegação; apenas e-mail e senha |
| Login colaborador nos quatro breakpoints | sem navegação; apenas e-mail e senha; sem CPF |
| Catálogo público no browser | renderizou sem erro de chunk após reinício do build |

Os testes automatizados cobrem aliases de segmento, presença dos filtros, separação dos shells, ausência de CPF no login e adoção do `Dialog` nos overlays críticos.

## Bloqueios externos encontrados

1. Todas as cópias locais de `DATABASE_URL` estão vazias. Por isso `/api/cartas/` responde `500` no ambiente local e não foi possível provar visualmente a carga de registros reais.
2. `RESEND_API_KEY` não está configurada localmente. O envio real do e-mail de redefinição não foi disparado.
3. Não há credencial de usuário de teste nem banco de homologação disponível para um E2E autenticado completo.

Nenhuma chave ou senha deve ser adicionada a arquivos versionados. Configure os segredos no ambiente de homologação/produção.

## Dívida restante

### Próxima prioridade — homologação funcional

- [ ] Aplicar `npm run db:migrate` explicitamente no ambiente correto, após backup e revisão.
- [ ] Configurar `DATABASE_URL`, `AUTH_SECRET` e `RESEND_API_KEY` no ambiente seguro.
- [ ] Executar E2E real: login, esqueci a senha, redefinição, invalidação da sessão antiga, filtros e reserva.
- [ ] Executar teste de concorrência com duas reservas simultâneas para a mesma carta.
- [ ] Validar que o usuário Marcus recebe o e-mail de redefinição; não definir senha manualmente no código ou no banco sem procedimento administrativo autorizado.

### Qualidade global

- [ ] O lint global ainda possui 145 erros e 41 avisos herdados em 46 arquivos.
- [ ] Maiores grupos: 116 `no-explicit-any`, 32 `no-unused-vars`, 9 `prefer-const`, 9 `no-require-imports`, 6 `no-img-element` e 4 links internos com `<a>`.
- [ ] A maior concentração está em scripts legados, cópias de Google Apps Script e áreas de admin/API fora do fluxo crítico desta execução.

### Unificação visual do ecossistema

- [ ] Migrar progressivamente as páginas institucionais, LPs, CRM e dashboards para os tokens e componentes compartilhados.
- [ ] Criar inventário visual das 17 LPs e remover divergências de tipografia, espaçamento, botões, formulários e breakpoints.
- [ ] Adicionar regressão visual automatizada para 375, 768, 1024 e 1440 px.
- [ ] Expandir os testes acessíveis para todos os overlays não críticos restantes.

## Ordem segura para a próxima LLM

1. Rode `git status --short` e preserve todo o trabalho existente; as exclusões de páginas em `src/app/admin` correspondem aos arquivos movidos para os novos route groups ainda não rastreados.
2. Leia `AGENTS.md` e a documentação local da versão instalada do Next antes de editar.
3. Configure somente um banco de homologação e execute `npm run db:migrate` de forma explícita.
4. Rode o E2E autenticado e registre evidências sem imprimir dados pessoais ou segredos.
5. Corrija o lint por ondas pequenas, começando por código executado em produção, sem reformatar arquivos legados em massa.
6. Migre uma família visual por vez e mantenha `npm run typecheck`, `npm test` e `npm run build` verdes.

## Comandos de retomada

```powershell
npm run typecheck
npm test
npm run lint
npm run build
```

`npm run lint` ainda é esperado falhar até a dívida global descrita acima ser tratada. Não confundir esse resultado com o lint do conjunto crítico, que está limpo.

## Segurança

Nenhuma senha real foi alterada ou gravada nesta implementação. O fluxo recomendado para Marcus é a redefinição por e-mail. CPF pode permanecer apenas como dado cadastral protegido e não deve ser usado para autenticação.
