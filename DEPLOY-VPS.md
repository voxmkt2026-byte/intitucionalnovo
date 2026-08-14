# Migração para a VPS Hostinger

Esta branch parte do commit de produção restaurado
`22ae8abfbe5c800bc118c3b1017342ee3a0f3198`.

## Pré-requisitos

- executar no nó manager do Docker Swarm;
- usar uma rede overlay já conectada ao Traefik;
- conhecer o nome do `certresolver` configurado no Traefik;
- manter o arquivo de produção fora do Git e com permissão `600`.

## Subida sem troca de DNS

```sh
chmod 700 scripts/deploy-vps.sh
chmod 600 /opt/titanium/.env.production.local

APP_DOMAIN=titaniumconsultorias.com.br \
TRAEFIK_NETWORK=nome_da_rede_traefik \
TRAEFIK_CERTRESOLVER=nome_do_resolver \
./scripts/deploy-vps.sh /opt/titanium/.env.production.local
```

O script cria os segredos que ainda não existirem, constrói a imagem local e
publica uma única réplica no Swarm. Ele não altera DNS e não remove a Vercel.

## Validação antes do corte

1. Confirmar `1/1` em `docker service ls`.
2. Confirmar `status: ok` em `/api/health/` usando resolução temporária.
3. Validar home, login administrativo, login de representante, consulta ao
   Neon, criação de lead e geração de PDF.
4. Trocar os registros `@` e `www` somente depois desses testes.
5. Manter a Vercel disponível durante pelo menos 24 horas de observação.

## Rollback

Antes da remoção da Vercel, o rollback é somente restaurar os registros DNS
anteriores. Para falha numa atualização da stack:

```sh
docker service rollback titanium_site
```
