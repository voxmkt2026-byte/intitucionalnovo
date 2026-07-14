# Configuração do Domínio — titaniumconsultorias.com.br → Vercel

## Opção A: Trocar os Nameservers (RECOMENDADA) ✅

> [!IMPORTANT]
> Esta é a opção mais simples. A Vercel gerencia tudo automaticamente (SSL, CDN, redirects).

### No Registro.br:

1. Acesse **registro.br/painel/dominios**
2. Clique em **titaniumconsultorias.com.br**
3. Clique em **"ALTERAR SERVIDORES DNS"**
4. **Substitua** os servidores atuais por:

| Campo | Valor ATUAL | Valor NOVO |
|-------|------------|------------|
| Servidor 1 | `ns252.prodns.com.br` | **`ns1.vercel-dns.com`** |
| Servidor 2 | `ns253.prodns.com.br` | **`ns2.vercel-dns.com`** |

5. Clique em **"SALVAR ALTERAÇÕES"**
6. Aguarde **até 48h** para propagação (geralmente leva 1-4 horas)

> [!WARNING]
> Se você tem email ou outros serviços na HostGator (ns252/ns253.prodns.com.br), use a **Opção B** para não perder email.

---

## Opção B: Manter HostGator DNS + Apontar A/CNAME

> Use esta opção se você tem **email** ou outros serviços no DNS atual da HostGator.

### No painel da HostGator (cPanel → Zone Editor):

1. Adicione um **registro A** para o domínio raiz:
   ```
   Tipo: A
   Nome: titaniumconsultorias.com.br
   Valor: 76.76.21.21
   TTL: 300
   ```

2. Adicione um **registro CNAME** para www:
   ```
   Tipo: CNAME
   Nome: www.titaniumconsultorias.com.br
   Valor: cname.vercel-dns.com
   TTL: 300
   ```

---

## Verificar se está funcionando

Depois de configurar, teste:
- https://titaniumconsultorias.com.br
- https://www.titaniumconsultorias.com.br

Ambos devem mostrar o site da Titanium.

Para checar a propagação DNS:
- https://dnschecker.org/#A/titaniumconsultorias.com.br

> [!TIP]
> A Vercel emite o certificado SSL automaticamente depois que o DNS propagar. Não precisa fazer nada extra.
