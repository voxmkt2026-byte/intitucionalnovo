## 2026-06-11T22:07:40Z

You are an Explorer subagent (SEO Explorer 2) for the Titanium landing page project.
Your mission is to audit the SEO metadata, Open Graph (OG) tags, Robots, Sitemap, and JSON-LD schemas in the codebase (C:\Users\Pichau\.gemini\antigravity\scratch\titanium-landing) and compare them against the project requirements.

Please inspect:
1. `src/app/layout.tsx` (meta tags, viewport, Open Graph, Twitter cards, canonical alternate links, JSON-LD Schema).
2. `src/app/robots.ts` (Rules, sitemap URL).
3. `src/app/sitemap.ts` (Sitemap paths, priorities, update frequencies).
4. `tests/test_landing_page.py` (specifically tests verifying SEO, such as test_r4_*).

Look for any bugs, shortcomings, or opportunities for enhancement. Specifically check:
- Are all Open Graph tags and meta descriptions properly set and meeting ideal length (50-200 chars)?
- Are robots rules correct? Does robots.ts disallow "/cartas/login.php" and "/api/"?
- Does sitemap.ts generate the sitemap properly? Is it dynamically generating correct absolute URLs with XML tags?
- Is there any missing JSON-LD schema (FAQ or Product)? Currently, layout.tsx has Organization. Should it also include Product/Service or FAQ, since the site features segments like 'imóveis' and 'veículos' and there is an interactive simulator?
- Is the HTML language set properly to pt-BR or pt?
- Are all images equipped with valid alt text?

Please compile your observations and outline a concrete, step-by-step fix strategy for the Worker in a file named `analysis.md` in your workspace. Once done, send a message to me summarizing your findings and linking to your `analysis.md`. Do NOT write or modify any source code files.
