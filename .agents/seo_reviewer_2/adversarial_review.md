## Challenge Summary

**Overall risk assessment**: LOW

## Challenges

### [Low] Challenge 1: Hardcoded sitemap dates

- **Assumption challenged**: The sitemap dates will remain accurate representation of content updates.
- **Attack scenario**: If the landing page content is updated, search engines may not crawl the changes promptly because the `<lastmod>` tag is hardcoded to `2026-06-11`.
- **Blast radius**: Delayed SEO indexing of future page updates.
- **Mitigation**: Introduce a dynamic build-time date generation or a content CMS webhook to update the modification date programmatically, while keeping it static between builds.

### [Low] Challenge 2: Head JSON-LD injection without sanitization

- **Assumption challenged**: The `jsonLd` structure remains static and safe from user-injected scripts.
- **Attack scenario**: If parts of the JSON-LD schema are modified to fetch dynamic data in the future (e.g. dynamic company reviews or user-generated feedback), using `dangerouslySetInnerHTML` directly without sanitization could lead to Cross-Site Scripting (XSS).
- **Blast radius**: Execution of unauthorized scripts in the client's browser.
- **Mitigation**: Ensure any future dynamic values integrated into `jsonLd` are strictly sanitized or validated using a library like DOMPurify or custom validator.

## Stress Test Results

- **Sitemap static dates check** → Checked sitemap.xml output → `<lastmod>2026-06-11T00:00:00.000Z</lastmod>` returned consistently → PASS.
- **theme-color rendering check** → Checked index HTML for theme-color meta tag → `<meta name="theme-color" content="#1b4332"/>` rendered correctly → PASS.

## Unchallenged Areas

- **Dynamic server-side responses** — Tested in development mode; production builds (`next build && next start`) were not independently stress-tested.
