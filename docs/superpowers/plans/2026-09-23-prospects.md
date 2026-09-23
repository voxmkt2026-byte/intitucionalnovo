# Simulação personalizada para prospecção — plano de implementação

> Execução: `superpowers:executing-plans`, nesta sessão. O usuário autorizou identificar o projeto correto e implementar o escopo fornecido.

**Objetivo:** receber prospects por um link individual, apresentar simulação, registrar interesse por WhatsApp ou ligação, sem interferir nas campanhas.

**Arquitetura:** aplicação `titanium-landing` na pasta interna `intitucionalnovo-main`. Ela tem package.json, configuração Next e Vercel próprios; a raiz externa é outra aplicação (`portal-representantes`, remoto `api-meta-e-google`). Não há importação entre as duas. A nova área usa o Neon diretamente, como o restante deste site. Componentes existentes são reutilizados e somente o simulador ganha props opcionais.

**Stack:** Next 16.2.9, React 19, TypeScript, Zod, Neon, Tailwind 4.

**Spec:** escopo técnico anexado pelo usuário, “Página de simulação personalizada para prospecção outbound”.

## Restrições
- Preservar admin, representantes, leads, marketing, layout, proxy, configurações Next, home, LPs e componentes de cartas.
- Alterar arquivos existentes somente em `ParcelSimulator.tsx`, `scripts/migrate.mjs` e acrescentar `/s/` ao robots.
- Nenhuma nova variável de ambiente, dependência de produção ou escrita em prospects pela aplicação.
- Prospects não usam `/api/leads/`. Fetches same-origin usam barra final.
- Token inválido renderiza simulador padrão, HTTP 200, sem eventos.
- Usuário fará branch, push e deploy. Entregar instruções de Root Directory e SQL; não executar migração no banco de produção.

## Tarefas e validação
1. [x] Banco e repositório: criar DTO público, registro exclusivamente servidor com id, consulta parametrizada com ativo/expiração e registro de eventos tolerante a falhas. Adicionar as duas tabelas ao final da migração, sem modificar os blocos anteriores. Testar tokens ausentes, inativos e expirados; conferir SQL em banco local descartável.
2. [x] Correção isolada do simulador: manter markup e fórmulas; enviar `months` numérico e atribuição já capturada. Guardar patch isolado e referência da renderização anterior.
3. [x] Props opcionais: inicializar e limitar crédito/prazo, ocultar contato quando solicitado, bloquear leads com token, emitir valores atuais com callback. Testar renderização padrão idêntica e casos imóvel/veículo fora dos limites.
4. [x] Rotas: contato e evento com Zod, limites reais em bytes, JSON inválido 400, excesso 413, token inválido 404 e rate limit existente. Testar respostas e escrita dos eventos; não expor id nem erros de banco.
5. [x] Página e componentes: Server Component dinâmico, abertura via `after`, cliente com debounce 1,5s, WhatsApp não bloqueante, formulário acessível e cartas compatíveis. Verificar desktop/mobile, mensagens e eventos com dados fictícios.
6. [x] Entrega: testes, tipos, build, verificação de hashes de arquivos protegidos, LPs públicas, documentação de deploy/SQL e revisão independente.

## Foco de revisão
- Links expiram durante a sessão: APIs revalidam token em cada ação.
- Corpos sem Content-Length e Unicode: contar bytes efetivamente recebidos.
- Falha de log nunca quebra página/navegação; comportamento silencioso segue o escopo.
- Callback estável e debounce: não criar loop nem registrar recálculo inicial.
- Plano Conforto usa prazo efetivo e parcela coerentes com a fórmula existente.

## Decisões de execução
- A pasta interna não está versionada no Git externo; comparar hashes com baseline local, sem reorganizar/copiar o site para a raiz.
- `ProspectDTO` não contém id. Uma consulta exclusivamente servidor resolve id ao registrar evento, sem serializá-lo para o navegador.
- O limite global continua 20/min, mesmo que a rota de eventos permita 30/min.
- Como a API existente retorna também cartas indisponíveis, o bloco novo oculta essas cartas localmente e não altera a vitrine.

## Progresso
- Tarefas 1–6 concluídas. Testes RED→GREEN documentados nos resultados da sessão; suíte 24/24, typecheck e build passaram.
- Banco local PostgreSQL/PGlite executou o SQL real e registrou abertura, whatsapp_click, recalculo e contato_form; zero linhas em leads.
- QA no build real: HTTP 200 válido/inválido, três cartas, envio do formulário, WhatsApp, desktop/mobile, sem erros JS ou overflow.
- Revisão independente sem achados P1/P2; preservados fallback padrão e log tolerante a falhas conforme escopo.
- Exceção autorizada pelo usuário: copiar logo-titanium.png existente para public/img/logo-titanium-dark.png. Corrige referência ausente sem editar Navbar.
- Build local alertou múltiplos lockfiles ancestrais; next.config permanece intacto. Documentado Root Directory correto para deploy.
- Branch/push/deploy ficam com o usuário conforme solicitado.
