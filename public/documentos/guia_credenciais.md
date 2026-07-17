# Guia Rápido — Credenciais para o n8n

## ⏱️ Tempo total: ~10 minutos

---

## 🔴 Passo 1: Meta Access Token (5 min)

1. Abra: **[business.facebook.com/events_manager](https://business.facebook.com/events_manager)**
2. No menu lateral, selecione **Origens de dados** (Data Sources)
3. Clique no seu **Pixel** → deve aparecer: `1667309107949808`
4. Clique na aba **⚙️ Configurações** (Settings)
5. Role para baixo até a seção **"API de Conversões"** (Conversions API)
6. Clique no botão **"Gerar token de acesso"** (Generate Access Token)
7. Se pedir confirmação, clique **"Continuar"**
8. O token aparece — **copie-o** (começa com `EAA...`, tem ~200 caracteres)

```
Formato esperado:
EAAIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxZD
```

> [!WARNING]
> Se não aparecer a opção de gerar token, talvez você precise de permissão de admin no Business Manager. Verifique em: Configurações do Negócio → Pessoas → seu nome → Nível de acesso.

---

## 🔴 Passo 2: Google Ads Customer ID (1 min)

1. Abra: **[ads.google.com](https://ads.google.com)**
2. Olhe no **canto superior direito**, próximo à sua foto/ícone de conta
3. O ID aparece no formato: **`123-456-7890`**
4. **Copie** esse número

```
Formato esperado:
182-265-1883 (exemplo)
```

> Se você gerencia múltiplas contas, certifique-se de selecionar a conta da **Titanium**.

---

## 🟡 Passo 3: Criar conta n8n Cloud (3 min)

1. Abra: **[app.n8n.cloud/register](https://app.n8n.cloud/register)**
2. Crie uma conta (email + senha ou Google login)
3. O trial de **14 dias gratuito** começa automaticamente
4. Após entrar, copie a **URL do seu workspace** — algo como:
   ```
   https://titanium.app.n8n.cloud
   ```

---

## ✅ O que me enviar

Quando tiver os dados, cole aqui:

```
Meta Token: EAA...
Google Ads ID: 123-456-7890
n8n URL: https://seuworkspace.app.n8n.cloud
```

Eu configuro todo o workflow em ~30 minutos após receber.

---

## 🔒 Segurança

- O Meta Token e Google credentials serão usados **apenas** dentro do n8n
- Nunca ficam expostos no código do site
- O n8n Cloud tem criptografia em repouso
- Recomendo criar um token dedicado (não usar token pessoal)
