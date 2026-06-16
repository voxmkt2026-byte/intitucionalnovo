# SEO Audit and Enhancement Strategy — Titanium Landing Page

This document compiles the SEO audit observations for the Titanium landing page project and outlines a concrete, step-by-step implementation strategy for the Worker to enhance search engine optimization, structured metadata, and schema markup.

---

## 1. Executive Summary

An audit of the Titanium landing page codebase confirms that the project already implements a high standard of SEO best practices. The page title, description, robots rules, sitemap generation, HTML language properties, and image alt attributes are fully configured and functional, as validated by the passing Playwright/Pytest test suite (`test_r4_*`).

However, there are two primary areas for improvement to elevate the page's search performance and mobile presence:
1. **JSON-LD Schema Enrichment**: Currently, the page only provides an `Organization` schema. Since the site serves as a landing page for high-value financial credit assets (Cartas Contempladas) in the property and vehicle segments, adding a `Service` schema and an `FAQPage` schema will help Google display rich search results (Rich Snippets).
2. **Mobile Viewport Theme Color**: Next.js 14/15 separates the `Viewport` configuration from the `Metadata` object. We should export a dedicated `viewport` config to specify the `themeColor` using the brand's primary emerald color, which improves visual alignment in mobile browsers.

---

## 2. Detailed Audit Observations

### 2.1 Meta Descriptions & Open Graph (OG) Tags
- **Observation**:
  - Main Description: `"Especialistas em cartas contempladas para imóveis e veículos. Segurança jurídica, transparência total e as melhores taxas do mercado."` (Length: **126 characters**).
  - OG Description: `"Seu imóvel ou veículo sem financiamento, sem juros e com segurança jurídica. Cartas contempladas auditadas com as menores taxas do mercado."` (Length: **139 characters**).
  - Twitter Description: `"Seu imóvel ou veículo sem financiamento, sem juros e com segurança jurídica."` (Length: **76 characters**).
- **Assessment**: **Optimal**. All values are within the ideal SEO threshold (50 to 200 characters) and contain high-relevance keywords.
- **Enhancement Opportunity**: The Open Graph and Twitter images are set to a static logo: `"https://titaniumconsultoria.com.br/cartas/titanium-logo.png"`. In the future, using a rich 1200x630px social banner (matching the premium visual identity) is recommended.

### 2.2 Robots Rules (`src/app/robots.ts`)
- **Observation**:
  - Allowed: `"/"`
  - Disallowed: `["/cartas/login.php", "/api/"]`
  - Sitemap: `"https://titaniumconsultoria.com.br/sitemap.xml"`
- **Assessment**: **Correct**. It accurately prevents crawler access to the legacy/admin login page and the API endpoints while allowing full indexation of the landing page.

### 2.3 Sitemap Config (`src/app/sitemap.ts`)
- **Observation**:
  - Base URL: `"https://titaniumconsultoria.com.br"` (hardcoded).
  - Configures index page (`/`, weekly frequency, priority 1.0) and dynamic segment query paths (`/cartas/cartas.php?segmento=imovel`, `/cartas/cartas.php?segmento=veiculo`, daily frequency, priority 0.9).
- **Assessment**: **Correct**. Next.js automatically parses `sitemap.ts` into a valid XML format `/sitemap.xml`. The priority and change frequencies reflect the rate of asset list updates in the database.

### 2.4 HTML Language Setting
- **Observation**: `src/app/layout.tsx` line 94 declares `<html lang="pt-BR" ...>`.
- **Assessment**: **Correct**. Setting the language to Portuguese (Brazil) ensures proper indexing on local search engine portals (google.com.br).

### 2.5 Image Alt Texts
- **Observation**: Checked all components utilizing images (`Navbar.tsx`, `Hero.tsx`, `About.tsx`, `Footer.tsx`):
  - `Navbar.tsx` (Line 75): `alt="Titanium Consultoria"`
  - `Hero.tsx` (Line 191): `alt="Interior de imóvel premium representando as oportunidades da Titanium Consultoria"`
  - `About.tsx` (Line 49): `alt="Equipe Titanium Consultoria analisando oportunidades do mercado"`
  - `Footer.tsx` (Line 50): `alt="Titanium Consultoria"`
- **Assessment**: **Optimal**. All image assets have non-empty, descriptive alt tags, ensuring WCAG accessibility compliance and image search indexing.

### 2.6 JSON-LD Schema
- **Observation**:
  - `layout.tsx` (Lines 67-86) defines a single `Organization` schema.
- **Assessment**: **Incomplete**. Since the site features segments like 'imóveis' and 'veículos' and has an interactive simulator, it is highly recommended to include a `Service` schema (for the brokerage/compliance advice) and an `FAQPage` schema (for general questions on consortiums/transfers).

### 2.7 Viewport Configuration
- **Observation**: Missing explicit mobile integration properties like `themeColor` and custom `viewport` settings.
- **Assessment**: **Shortcoming**. Next.js deprecated `viewport` inside the main `Metadata` object. A separate `viewport` object should be exported to configure mobile settings.

---

## 3. Step-by-Step Fix Strategy for the Worker

The Worker should perform the following non-breaking changes in `src/app/layout.tsx`:

### Step 1: Enrich JSON-LD with Service and FAQPage Schemas
The current `jsonLd` object inside `src/app/layout.tsx` should be modified to export an array containing `Organization`, `Service`, and `FAQPage` schemas.

#### Before (`src/app/layout.tsx`, Lines 67-86):
```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Titanium Consultoria",
  url: "https://titaniumconsultoria.com.br",
  logo: "https://titaniumconsultoria.com.br/cartas/titanium-logo.png",
  description:
    "Especialistas em cartas contempladas para imóveis e veículos com segurança jurídica total.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+55-11-95101-4269",
    contactType: "customer service",
    availableLanguage: "Portuguese",
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "BR",
  },
  sameAs: [],
};
```

#### After:
```typescript
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://titaniumconsultoria.com.br/#organization",
    name: "Titanium Consultoria",
    url: "https://titaniumconsultoria.com.br",
    logo: "https://titaniumconsultoria.com.br/cartas/titanium-logo.png",
    description:
      "Especialistas em cartas contempladas para imóveis e veículos com segurança jurídica total.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+55-11-95101-4269",
      contactType: "customer service",
      availableLanguage: "Portuguese",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "BR",
    },
    sameAs: [],
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://titaniumconsultoria.com.br/#service",
    name: "Intermediação de Cartas Contempladas",
    provider: {
      "@id": "https://titaniumconsultoria.com.br/#organization"
    },
    description:
      "Assessoria especializada na aquisição, cessão e transferência de cotas de consórcios contempladas para imóveis e veículos com auditoria jurídica de compliance.",
    areaServed: "BR",
    category: "Financial Services",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "O que é uma carta de crédito contemplada?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Uma carta contemplada é uma cota de consórcio que já passou pelo sorteio ou foi comtemplada via lance. Ela possibilita a utilização imediata do crédito para a aquisição de imóveis ou veículos sem a necessidade de aguardar novos sorteios."
        }
      },
      {
        "@type": "Question",
        "name": "Como funciona a segurança jurídica na cessão de cotas da Titanium?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Na Titanium Consultoria, todas as cotas passam por uma rigorosa auditoria jurídica (due diligence) interna antes de serem anunciadas. A cessão e transferência de titularidade ocorrem em total conformidade regulatória com as administradoras e o Banco Central do Brasil."
        }
      },
      {
        "@type": "Question",
        "name": "Quais as vantagens das cotas contempladas em comparação a financiamentos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A principal vantagem é a isenção de juros reais. As cartas contempladas possuem apenas uma taxa de administração diluída ao longo do prazo da cota, oferecendo um custo total de aquisição substancialmente menor se comparado às taxas de juros de financiamentos bancários."
        }
      },
      {
        "@type": "Question",
        "name": "Como posso simular as parcelas?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Utilizando o Simulador Inteligente na nossa página principal, você seleciona o segmento desejado (Imóvel ou Veículo), define o valor do crédito e o prazo ideal de pagamento para estimar e comparar instantaneamente os planos Titanium e Conforto."
        }
      }
    ]
  }
];
```

### Step 2: Add Viewport metadata export in `src/app/layout.tsx`
Add a dedicated `viewport` configuration to configure mobile properties, specifically set the `themeColor` to the brand's primary emerald color (`#1b4332`).

#### Before:
(No Viewport export exists in the file)

#### After (Append after metadata export):
```typescript
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#1b4332",
  width: "device-width",
  initialScale: 1,
};
```
Make sure to also update the import at line 1 to include `Viewport`:
```typescript
import type { Metadata, Viewport } from "next";
```

---

## 4. Verification Plan

After the Worker implements the changes:

1. **Verify compilation & types**:
   Ensure Next.js types check successfully.
   ```bash
   npx tsc --noEmit
   ```
2. **Run Pytest Suite**:
   Verify that all SEO and other landing page E2E tests still pass:
   ```bash
   python C:\Users\Pichau\.gemini\config\skills\webapp-testing\scripts\with_server.py --server "npm run dev" --port 3000 -- pytest -k r4
   ```
3. **Verify JSON-LD Structure**:
   Using chrome-devtools or direct HTML inspection, extract the `<script type="application/ld+json">` contents to ensure the generated array of objects parses correctly and contains the Organization, Service, and FAQPage schemas.
