#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Uso: APP_DOMAIN=... TRAEFIK_NETWORK=... TRAEFIK_CERTRESOLVER=... $0 /caminho/.env.production.local" >&2
  exit 2
fi

env_file=$1
if [ ! -f "$env_file" ]; then
  echo "Arquivo de variáveis não encontrado: $env_file" >&2
  exit 2
fi

: "${APP_DOMAIN:?Defina APP_DOMAIN sem www}"
: "${TRAEFIK_NETWORK:?Defina TRAEFIK_NETWORK}"
: "${TRAEFIK_CERTRESOLVER:?Defina TRAEFIK_CERTRESOLVER}"

swarm_state=$(docker info --format '{{.Swarm.LocalNodeState}}')
if [ "$swarm_state" != "active" ]; then
  echo "Docker Swarm não está ativo neste nó." >&2
  exit 1
fi

normalized_env="$(mktemp)"
trap 'rm -f "$normalized_env"' EXIT HUP INT TERM
chmod 600 "$normalized_env"
tr -d '\r' < "$env_file" > "$normalized_env"

set -a
# O arquivo é gerado pelo `vercel env pull` e precisa permanecer fora do Git.
# shellcheck disable=SC1090
. "$normalized_env"
set +a

secret_names="
ADMIN_SECRET
DATABASE_URL
GOOGLE_ADS_CLIENT_ID
GOOGLE_ADS_CLIENT_SECRET
GOOGLE_ADS_CUSTOMER_ID
GOOGLE_ADS_DEVELOPER_TOKEN
GOOGLE_ADS_REFRESH_TOKEN
JWT_SECRET
KOMMO_ACCESS_TOKEN
META_ACCESS_TOKEN
META_ACCESS_TOKEN_2
META_CAPI_ACCESS_TOKEN
META_CAPI_ACCESS_TOKEN_2
META_INSIGHTS_TOKEN_2
META_MARKETING_ACCESS_TOKEN
META_MARKETING_ACCESS_TOKEN_2
META_PIXEL_ID
META_PIXEL_ID_2
N8N_KOMMO_WEBHOOK_URL
SHEETS_WEBHOOK_URL
"

for secret_name in $secret_names; do
  eval "secret_value=\${$secret_name-}"
  if [ -z "$secret_value" ]; then
    echo "Segredo obrigatório ausente: $secret_name" >&2
    exit 1
  fi

  swarm_secret="titanium_$secret_name"
  if ! docker secret inspect "$swarm_secret" >/dev/null 2>&1; then
    printf %s "$secret_value" | docker secret create "$swarm_secret" - >/dev/null
    echo "Segredo criado: $swarm_secret"
  fi
done

APP_REVISION=${APP_REVISION:-22ae8abfbe5c800bc118c3b1017342ee3a0f3198}
APP_IMAGE=${APP_IMAGE:-titanium-consultoria:22ae8ab}
export APP_DOMAIN APP_IMAGE APP_REVISION TRAEFIK_CERTRESOLVER TRAEFIK_NETWORK

docker build --pull --tag "$APP_IMAGE" .
docker stack config --compose-file docker-stack.yml >/dev/null
docker stack deploy --compose-file docker-stack.yml --resolve-image never titanium

echo "Stack titanium enviada. Aguarde o healthcheck antes de alterar o DNS."
