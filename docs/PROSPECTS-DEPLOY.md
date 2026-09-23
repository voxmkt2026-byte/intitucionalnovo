# Entrega — simulação personalizada de prospecção

## Qual aplicação publicar

Nesta máquina há duas aplicações completas e independentes:

| Pasta | package.json | Função |
| --- | --- | --- |
| Pasta externa `intitucionalnovo-main` | `portal-representantes` | Portal administrativo; `/` redireciona ao login |
| Pasta interna `intitucionalnovo-main/intitucionalnovo-main` | `titanium-landing` | Site Titanium com home, simulador, LPs, vitrine, admin e representantes |

Todas as alterações desta entrega estão **na pasta interna**, que corresponde ao escopo. Ela não importa o código da aplicação externa. Possui `package.json`, lockfile, Next e configuração Vercel próprios. O Git externo aponta para `impulsionaioficial/api-meta-e-google`; a pasta interna ainda aparece como não versionada nesse repositório.

Para publicar no repositório do site (`intitucionalnovo`), use os caminhos relativos **à pasta interna**. Não é necessário copiar a aplicação externa, mudar seus redirects ou juntar os projetos. Se publicar o repositório externo inteiro, a Root Directory da Vercel será `intitucionalnovo-main`. Se publicar somente o conteúdo do site na raiz do repositório correto, será `.`.

O usuário fará a nova branch, push e deploy; nenhuma publicação ou migração de produção foi executada nesta sessão.

## Conexões e fluxo

```text
n8n → Neon: cria prospects e token aleatório
      ↓ link individual
/s/[token]/ → SELECT prospects (ativo + expiração)
      ├─ Server Component → after() → prospect_events: abertura
      └─ ParcelSimulator → valores atuais
             ├─ debounce 1,5 s → /api/prospects/[token]/evento/
             ├─ WhatsApp → wa.me + evento whatsapp_click
             └─ formulário → /api/prospects/[token]/contato/
                                  ↓
                             prospect_events
                                  ↓
                             n8n faz o restante

Cartas sugeridas → GET /api/cartas/ → CartaCard existente
```

Nenhuma rota de criação de prospects foi adicionada. O id interno do prospect não é enviado ao cliente. Os eventos da página personalizada não escrevem em `leads`, Kommo, Sheets, Meta CAPI ou Google Ads.

## Banco e Vercel

1. Criar a branch no repositório do site e enviar os arquivos desta entrega.
2. Na Vercel, selecionar a Root Directory conforme a tabela acima, framework Next.js e os comandos existentes (`npm install` e `npm run build`).
3. Manter as variáveis atuais. A funcionalidade nova usa somente `DATABASE_URL`; nenhuma variável foi adicionada. Para Preview, apontar essa variável para um banco/branch Neon de teste.
4. Executar **somente** `docs/prospects-schema.sql` nesse banco. O arquivo cria as duas tabelas e o índice de forma idempotente.
5. Executar `docs/prospect-test.sql` para inserir um registro fictício. O resultado informa o caminho a abrir no domínio do Preview.
6. Validar a página, WhatsApp e solicitação de ligação. Consultar os eventos com o SQL abaixo.
7. Antes do deploy de produção, aplicar o mesmo `prospects-schema.sql` no banco de produção. O build não executa migrações automaticamente.

O trecho também foi acrescentado ao final de `scripts/migrate.mjs`, como solicitado. Para um banco já em produção, o SQL separado evita executar novamente os blocos históricos do script, que também trabalham com tabelas antigas.

O lockfile existente contém dependências que exigem Node `^22.22.2`, `^24.15.0` ou `>=26.0.0`. A máquina desta sessão tem Node 24.14.1 e emitiu avisos de engine na instalação; testes e build passaram. Use uma versão compatível na publicação.

```sql
SELECT e.id, p.empresa, e.tipo, e.payload, e.criado_em
FROM prospect_events e
JOIN prospects p ON p.id = e.prospect_id
WHERE p.token = 'TOKEN_INSERIDO_NO_TESTE'
ORDER BY e.criado_em DESC;
```

Para novos links de prospecção, o n8n deve gerar tokens aleatórios base64url de ao menos 16 bytes. Exemplo de geração com Node:

```sh
node -e "console.log(require('node:crypto').randomBytes(24).toString('base64url'))"
```

## Arquivos existentes alterados

- `src/components/ParcelSimulator.tsx`: props opcionais, isolamento de prospects, callback dos valores e correção do payload da home. Faixas, fórmulas e markup padrão preservados.
- `scripts/migrate.mjs`: somente o bloco aditivo das duas tabelas e índice.
- `src/app/robots.ts`: somente `/s/` acrescentado à lista existente.

O patch `docs/patches/home-simulador-fix.patch` contém apenas a correção C. Pode ser aplicado na versão original do site caso se queira antecipar esse ajuste; não aplicar novamente sobre a entrega completa.

## Exceção autorizada: logotipo ausente

Foi criado `public/img/logo-titanium-dark.png`, cópia exata de `public/caminhao/assets/logo-titanium.png`, após autorização explícita do usuário. O arquivo era referenciado pela Navbar, mas não existia; isso causava 404 e repetição de requisições. Nenhum componente compartilhado ou asset existente foi editado.

## Arquivos novos de aplicação

- `src/features/prospects/domain/types.ts`
- `src/features/prospects/data/repository.ts`
- `src/features/prospects/data/http.ts`
- `src/app/api/prospects/[token]/contato/route.ts`
- `src/app/api/prospects/[token]/evento/route.ts`
- `src/app/s/[token]/page.tsx`
- `src/app/s/[token]/ProspectSimulatorClient.tsx`
- `src/components/prospect/CartasSugeridas.tsx`
- `src/components/prospect/ContatoProspectForm.tsx`
- `src/components/prospect/WhatsAppProspectButton.tsx`
- `src/components/prospect/events.ts`

Também foram adicionados testes, fixture do HTML original, documentação, SQL e evidências em `tests/` e `docs/`.

## Validação

- `npm test`: 24 testes passaram, incluindo os testes existentes.
- `npm run typecheck`: passou.
- `npm run build`: passou; `/s/[token]` e as duas APIs aparecem no build.
- ESLint nos arquivos alterados/novos: zero erros; dois avisos de handlers não utilizados que já existiam no simulador.
- Comparação do HTML do simulador sem props: idêntico ao original, byte a byte.
- Banco PostgreSQL/PGlite local em memória: tokens inativo, expirado e ausente não resolvem; quatro tipos de evento gravados; zero linhas inseridas em leads.
- Quatro LPs públicas: HTTP 200 e `Ref: tf_...` confirmado nos links de WhatsApp após execução dos scripts no navegador.
- Build real no Chrome: página válida e inválida HTTP 200, três cartas compatíveis, WhatsApp e contato gravados no banco local, zero chamadas a leads e zero erros JavaScript.
- Mobile 390 × 844: sem overflow horizontal; barra de WhatsApp fixa e formulário funcionando.
- Revisão independente: sem achados acionáveis de alta/média prioridade.

Evidências: `docs/validation/prospect-events-local.json`, `docs/validation/lps-production.json` `docs/validation/browser-local.json` e `docs/validation/protected-files.json`. Capturas: `docs/validation/prospect-desktop.png` e `docs/validation/prospect-mobile.png`. A validação de banco usa apenas dados fictícios; não constitui teste no Neon de produção.

## Comportamentos mantidos conforme o escopo

- Token inválido renderiza o simulador padrão sem props, incluindo a captação padrão caso o visitante a utilize; não grava eventos de prospect.
- O registro de eventos é tolerante a falhas: um erro de INSERT gera aviso no servidor e não quebra a página ou ação. Portanto, confirmação de contato não representa garantia de persistência se o banco falhar no INSERT.
- O limite global permanece 20 requisições/min por IP, prevalecendo sobre os 30/min específicos dos eventos. O debounce reduz chamadas, mas não remove o limite global.
- A API de cartas existente inclui cartas indisponíveis; o bloco novo filtra essas cartas entre os três resultados recebidos. A API e a vitrine original não foram alteradas.

## Confirmação de não interferência

A comparação SHA256 dos 620 arquivos existentes confirmou alterações somente em `ParcelSimulator.tsx`, `scripts/migrate.mjs` e `robots.ts` (exceção expressa do item A.4). Nenhum arquivo de admin, representantes, colaboradores, captura de leads, marketing, layout, proxy, vitrine, LPs, Navbar, Footer, CSS ou design system foi modificado. O único asset novo fora das pastas inicialmente previstas foi o logotipo expressamente autorizado.
