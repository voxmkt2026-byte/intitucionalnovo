## 2026-06-11T19:12:39-03:00

You are the Implementation Worker for the Titanium landing page project.
Your working directory is `C:\Users\Pichau\.gemini\antigravity\scratch\titanium-landing\.agents\worker_m5_seo\`.
Codebase directory is `C:\Users\Pichau\.gemini\antigravity\scratch\titanium-landing\`.

Your task is to implement the SEO metadata and schema enhancements on the landing page files.

### Integrity Warning:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Exact Changes Needed:

1. **Modify `src/app/layout.tsx`**:
   - Update the import statement on Line 1 to:
     ```typescript
     import type { Metadata, Viewport } from "next";
     ```
   - Right after the `export const metadata: Metadata = { ... };` block (around Line 65), export the `viewport` configuration object:
     ```typescript
     export const viewport: Viewport = {
       themeColor: "#1b4332",
       width: "device-width",
       initialScale: 1,
     };
     ```
   - Update the `jsonLd` schema definition. It should be a linked JSON-LD array containing the `Organization` schema and two `Service` schemas representing the credit intermediate segments:
     ```typescript
     const jsonLd = [
       {
         "@context": "https://schema.org",
         "@type": "Organization",
         "@id": "https://titaniumconsultoria.com.br/#organization",
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
         "@id": "https://titaniumconsultoria.com.br/#service-imovel",
         "name": "Cartas Contempladas de Imóveis",
         "provider": {
           "@id": "https://titaniumconsultoria.com.br/#organization"
         },
         "description": "Cotas pré-aprovadas destinadas a aquisição ou incorporação de imóveis residenciais premium e galpões comerciais sem juros e com segurança jurídica total.",
         "areaServed": "BR",
         "serviceType": "FinancialService"
       },
       {
         "@context": "https://schema.org",
         "@type": "Service",
         "@id": "https://titaniumconsultoria.com.br/#service-veiculo",
         "name": "Cartas Contempladas de Veículos",
         "provider": {
           "@id": "https://titaniumconsultoria.com.br/#organization"
         },
         "description": "Acesso à liquidez imediata para aquisição de frotas executivas ou veículos de alta performance com planejamento inteligente, sem juros.",
         "areaServed": "BR",
         "serviceType": "FinancialService"
       }
     ];
     ```
   - Ensure the layout component renders the structured data:
     ```typescript
     <script
       type="application/ld+json"
       dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
     />
     ```

2. **Modify `src/app/sitemap.ts`**:
   - Instead of dynamically calling `new Date()` inside the returned sitemap objects, define a static release/last update date (e.g. `2026-06-11`) so search engines do not see fake page updates on every request:
     ```typescript
     import type { MetadataRoute } from "next";

     export default function sitemap(): MetadataRoute.Sitemap {
       const baseUrl = "https://titaniumconsultoria.com.br";
       const lastModified = new Date("2026-06-11");

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

### Verification Requirements:
- You must run `npx tsc --noEmit` and `npm run build` to verify there are no typescript/build compilation errors.
- Run the E2E SEO test suite:
  `python C:\Users\Pichau\.gemini\config\skills\webapp-testing\scripts\with_server.py --server "npm run dev" --port 3000 -- pytest -k r4`
  and ensure all tests pass.
- Write your final handoff report (including compilation and test outputs) to `handoff.md` inside your working directory.
- Send a message back to me (parent conversation ID) once you're complete.
