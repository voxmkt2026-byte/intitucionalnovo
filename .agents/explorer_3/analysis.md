# SEO, Metadata, and Schema Audit Report — Titanium Landing Page

This document outlines the findings of the SEO and metadata audit performed on the Titanium landing page codebase, along with a concrete step-by-step fix strategy for the Worker.

---

## 1. Observations

### 1.1 `src/app/layout.tsx` (Meta Tags, Open Graph, Twitter Cards, Schema)
* **Metadata Length & Quality**:
  * Page Title: `"Titanium Consultoria | Cartas Contempladas de Elite"` (53 characters). Excellent length (ideal is 50-60 characters).
  * Page Description: `"Especialistas em cartas contempladas para imóveis e veículos. Segurança jurídica, transparência total e as melhores taxas do mercado."` (132 characters). Fits perfectly within the 50-200 characters ideal range.
  * Open Graph Description: `"Seu imóvel ou veículo sem financiamento, sem juros e com segurança jurídica. Cartas contempladas auditadas com as menores taxas do mercado."` (141 characters). Fits perfectly within the 50-200 characters ideal range.
  * Twitter Card Description: `"Seu imóvel ou veículo sem financiamento, sem juros e com segurança jurídica."` (78 characters). Fits perfectly within the 50-200 characters ideal range.
* **Open Graph / Twitter Configurations**:
  * Properly configured with title, description, URL, site name, locale (`pt_BR`), and absolute image URL (`https://titaniumconsultoria.com.br/cartas/titanium-logo.png`).
  * Twitter card set to `summary_large_image` with absolute image path.
* **Canonical URL**:
  * Set to `https://titaniumconsultoria.com.br` (correct).
* **Viewport Config**:
  * **Shortcoming**: No explicit `viewport` metadata is exported. In Next.js 14, it is recommended to explicitly export a `viewport` configuration object rather than relying on default behaviors to guarantee responsiveness.
* **HTML Language**:
  * Properly declared as `lang="pt-BR"` (correct).
* **JSON-LD Schema**:
  * **Shortcoming**: Currently only includes the `Organization` schema.
  * **Enhancement Opportunity**: Since the landing page showcases specific segments (Imóveis and Veículos) and features an interactive parcel simulator, we should include `Service` (or `FinancialProduct`) schemas for both segments. This allows search engines to better index and display rich snippets for these financial services. (Note: No FAQ section is present on the page, so an `FAQPage` schema should NOT be added to avoid search engine penalties for mismatching content).

### 1.2 `src/app/robots.ts` (Rules, Sitemap URL)
* **Rules**:
  * userAgent: `*`
  * allow: `/`
  * disallow: `["/cartas/login.php", "/api/"]` (correctly disallows the login page and backend API routes).
* **Sitemap URL**:
  * Configured as `"https://titaniumconsultoria.com.br/sitemap.xml"` (correct).

### 1.3 `src/app/sitemap.ts` (Sitemap Paths, Priorities, Frequencies)
* **Paths**:
  * `/` (Priority: 1.0, changeFrequency: `weekly`)
  * `/cartas/cartas.php?segmento=imovel` (Priority: 0.9, changeFrequency: `daily`)
  * `/cartas/cartas.php?segmento=veiculo` (Priority: 0.9, changeFrequency: `daily`)
* **Shortcoming**:
  * **`lastModified` Dynamic Generation**: The sitemap uses `new Date()` for all entries. This dynamically generates the current timestamp on every request, signaling to crawlers that all pages have updated even if no changes occurred. It should be replaced with a static date (e.g., last build date or content update date) or omitted if dynamic updates aren't available.

### 1.4 Image Alt Texts
* **Audit Result**: All images used in the project have explicit, valid, descriptive alt text. No images are missing alt tags, and none have empty `alt=""` values.
  * `src/components/About.tsx`: `alt="Equipe Titanium Consultoria analisando oportunidades do mercado"`
  * `src/components/Hero.tsx`: `alt="Interior de imóvel premium representando as oportunidades da Titanium Consultoria"`
  * `src/components/Navbar.tsx`: `alt="Titanium Consultoria"`
  * `src/components/Footer.tsx`: `alt="Titanium Consultoria"`

### 1.5 E2E Tests (`tests/test_landing_page.py`)
* Verified that the test suite has 11 E2E tests specifically targeting SEO (`r4` tests), which test title, description, robots, canonical links, OG tags, H1 counts, missing alt text, description length, lang attribute, and sitemap accessibility.
* **Results**: All 15 tests matching `r4` (including 5 Tier 4 user scenarios) passed successfully.

---

## 2. Step-by-Step Fix Strategy for the Worker

The Worker should perform the following changes in the codebase.

### Step 1: Export viewport configuration in `src/app/layout.tsx`
Add a dedicated `viewport` metadata export to enforce mobile viewport rendering configuration:
```typescript
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b251a", // Emerald deep color for premium aesthetics
};
```

### Step 2: Expand JSON-LD schemas in `src/app/layout.tsx`
Modify `jsonLd` inside `src/app/layout.tsx` to include `Service` schemas for the real estate and vehicle credit intermediate segments:
```typescript
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Titanium Consultoria",
    "url": "https://titaniumconsultoria.com.br",
    "logo": "https://titaniumconsultoria.com.br/cartas/titanium-logo.png",
    "description": "Especialistas em cartas contempladas para imóveis e veículos com segurança jurídica total.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+55-11-95101-4269",
      "contactType": "customer service",
      "availableLanguage": "Portuguese",
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR",
    },
    "sameAs": []
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Cartas Contempladas de Imóveis",
    "provider": {
      "@type": "Organization",
      "name": "Titanium Consultoria",
      "url": "https://titaniumconsultoria.com.br"
    },
    "description": "Cotas pré-aprovadas destinadas a aquisição ou incorporação de imóveis residenciais premium e galpões comerciais sem juros e com segurança jurídica total.",
    "areaServed": "BR",
    "serviceType": "FinancialService"
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Cartas Contempladas de Veículos",
    "provider": {
      "@type": "Organization",
      "name": "Titanium Consultoria",
      "url": "https://titaniumconsultoria.com.br"
    },
    "description": "Acesso à liquidez imediata para aquisição de frotas executivas ou veículos de alta performance com planejamento inteligente, sem juros.",
    "areaServed": "BR",
    "serviceType": "FinancialService"
  }
];
```
*Note: Make sure to stringify `jsonLd` properly inside the script tag using `JSON.stringify(jsonLd)`.*

### Step 3: Replace dynamic `new Date()` with build date in `src/app/sitemap.ts`
To avoid crawlers flagging fake updates, define the last modifications statically or retrieve them from a stable source:
```typescript
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://titaniumconsultoria.com.br";
  const lastModified = new Date("2026-06-11"); // Date of last major content/infrastructure update

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/cartas/cartas.php?segmento=imovel`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cartas/cartas.php?segmento=veiculo`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
```

### Step 4: Verification
After applying the fixes, run the E2E test suite to verify:
1. `npm run build` is successful without TypeScript compilation errors.
2. Run `pytest -k r4` (or the full suite) to ensure all tests pass.
