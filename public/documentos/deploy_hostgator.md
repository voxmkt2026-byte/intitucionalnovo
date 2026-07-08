# Deploy Titanium Institucional → Hostgator

## Arquitetura final no servidor

```
public_html/
├── index.html          ← Site institucional (página raiz)
├── _next/              ← Assets Next.js (CSS, JS, fontes)
├── missao-visao-valores/
│   └── index.html
├── trajetoria/
│   └── index.html
│
├── uber/               ← LP Uber (HTML estático)
│   └── index.html
├── caminhao/           ← LP Caminhão
│   └── index.html
├── carta-contemplada/
├── maquinas-agricolas/
├── terrenos-construcao/
├── carro-luxo/
├── empresario/
├── medico/
├── placas-solares/
├── aeronaves/
└── embarcacao/
```

> [!IMPORTANT]
> O institucional fica em `public_html/` (raiz).
> As LPs ficam em subpastas como `public_html/uber/index.html`.
> As duas coisas coexistem no mesmo servidor — sem conflito.

---

## Opção A — FTP Manual (para fazer agora)

### 1. Gerar o build estático

```bash
# Na pasta do projeto institucional:
npm run build
# Isso cria a pasta /out com todo o HTML/CSS/JS
```

### 2. Acessar o Hostgator

1. Acesse [cpanel.hostgator.com.br](https://cpanel.hostgator.com.br) com suas credenciais
2. Vá em **Gerenciador de Arquivos** → `public_html/`

### 3. Upload via cPanel File Manager

1. Compactar a pasta `out/` em um `.zip`
2. No cPanel: **Fazer Upload** → selecione o `.zip`
3. Extraia o zip dentro de `public_html/`
4. ✅ Site no ar

### 3. Alternativa — FileZilla (mais rápido para muitos arquivos)

```
Host:     ftp.titaniumconsultorias.com.br  (ou o IP do servidor)
Usuário:  seu_usuario_cpanel
Senha:    sua_senha_cpanel
Porta:    21
```

Arraste o conteúdo de `out/` para `public_html/`.

---

## Opção B — GitHub Actions (deploy automático — recomendado)

Toda vez que você fizer `git push`, o site atualiza automaticamente.

### 1. Configurar os Secrets no GitHub

1. Acesse seu repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
3. Adicione os 3 secrets:

| Secret Name | Valor | Onde encontrar |
|---|---|---|
| `FTP_HOST` | `ftp.titaniumconsultorias.com.br` | cPanel → Contas FTP |
| `FTP_USER` | Seu usuário FTP | cPanel → Contas FTP |
| `FTP_PASSWORD` | Sua senha FTP | A que você definiu no cPanel |

### 2. Push para main

```bash
git add .
git commit -m "feat: adiciona seção PersonaGateway"
git push origin main
```

O GitHub Action roda automaticamente:
- Instala dependências
- Faz `npm run build`
- Faz upload FTP da pasta `out/` para `public_html/`

> [!NOTE]
> O workflow já está configurado para **NÃO sobrescrever** as pastas das LPs (`/uber`, `/caminhao`, etc.) durante o upload do institucional.

---

## Upload das LPs (separado)

As LPs são HTML estáticos. Cada uma vai para sua subpasta:

```bash
# Exemplo: LP Uber
# Copie o index.html da LP para:
public_html/uber/index.html
public_html/uber/assets/   (se houver CSS/JS/imagens)
```

**Opções de upload:**
1. **Manual via cPanel** → mais simples, 1 vez só
2. **Script FTP automático** → posso criar um script que sobe todas as LPs de uma vez

---

## Verificação pós-deploy

Após upload, verifique:
- [ ] `www.titaniumconsultorias.com.br` → carrega institucional
- [ ] `www.titaniumconsultorias.com.br/#para-voce` → seção dos cards visível
- [ ] `www.titaniumconsultorias.com.br/uber` → LP Uber carrega
- [ ] Clique em "Para Você" no menu → rola para a seção

---

## Configuração de domínio (se ainda não estiver apontando)

No painel do seu registrador de domínio, aponte o DNS:

```
Tipo:  A
Host:  @  (ou www)
Valor: IP do servidor Hostgator  ← pegar no cPanel → "Informações do servidor"
TTL:   3600
```

---

## Plano Hostgator — compatibilidade

| Plano | Static HTML | Next.js SSR | Recomendação |
|---|---|---|---|
| **Shared (Básico/Plus)** | ✅ Sim | ❌ Não | Use `output: 'export'` (já configurado) |
| **Business** | ✅ Sim | ✅ Sim | Static export é mais simples de manter |
| **VPS / Cloud** | ✅ Sim | ✅ Sim | Pode rodar `npm start` se quiser SSR |

> [!TIP]
> Para o institucional + LPs estáticos, qualquer plano Shared funciona perfeitamente.
> O `output: 'export'` já está configurado no `next.config.ts`.
