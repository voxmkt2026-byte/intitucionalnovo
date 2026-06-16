## 2026-06-11T20:39:39Z

You are a developer and reviewer. Your task is to implement the visual redesign and copywriting refactoring plan for the Titanium landing page.
The codebase is located at: C:\Users\Pichau\.gemini\antigravity\scratch\titanium-landing

Please apply the following changes to the files:

1. `src/app/globals.css`:
   - Under `@theme inline`, add `--color-whatsapp: #25D366;`.
   - Define a `.bezel-highlight` class at the end of the file for a luxury inner border sweep:
     ```css
     .bezel-highlight {
       position: relative;
     }
     .bezel-highlight::after {
       content: "";
       position: absolute;
       inset: 0;
       border-radius: inherit;
       padding: 1px;
       background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.02));
       -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
       -webkit-mask-composite: xor;
       mask-composite: exclude;
       pointer-events: none;
     }
     ```

2. `src/components/Navbar.tsx`:
   - Replace `bg-emerald-deep text-white` with `bg-cta-bg text-cta-text` (lines 88, 179).
   - Replace `hover:bg-emerald-mid` with `hover:bg-cta-hover` (line 90).
   - Replace `bg-white/15` with `bg-cta-text/15` (lines 97, 185).
   - Apply `font-body` to the links (`line 71` - in `navLinks.map`).
   - Apply `font-heading` to the CTA button text and styling (lines 88, 179).
   - Change CTA text from "Falar com Especialista" to "Agendar Assessoria" (lines 94, 184).
   - Enhance the CTA arrow movement with design-system ease: change transition ease-bezier in CTA classes to `ease-out-expo`.

3. `src/components/Hero.tsx`:
   - Replace `font-[family-name:var(--font-heading)]` with `font-heading` (line 61).
   - Change Primary CTA color class from `bg-emerald-deep text-white hover:bg-emerald-mid` to `bg-cta-bg text-cta-text hover:bg-cta-hover`.
   - Re-architect the Glass Card Overlay (lines 200-215) to use the signature double-bezel structure (`bezel-outer` and `bezel-inner`) with `bg-cream/40 backdrop-blur-xl p-1.5` on the outer bezel, and `bg-cream/80 border border-card-border p-5` on the inner bezel.
   - Apply `font-body` to the subtitle (`line 79`), badges (`line 168`), and glass overlay text (`lines 208-212`).
   - Copywriting changes:
     - Elevate subtitle: change "Mais de 500 famílias..." to "A Titanium assessora a aquisição de cotas sob rigorosa auditoria jurídica. Mais de 500 patrimônios viabilizados com as menores taxas do mercado."
     - Elevate Primary CTA: change "Ver Oportunidades Disponíveis" to "Explorar Portfólio de Oportunidades".
     - Elevate Secondary CTA: change "Falar com Especialista" to "Consultar Especialista".
     - Elevate trust badges:
       - "Auditoria Jurídica" -> "Auditoria de Compliance"
       - "Liberação Rápida" -> "Transferência Imediata"
       - "Taxas Zero Juros" -> "Isenção de Juros Reais"
   - Add hover scale zoom on the hero image: make the `bezel-outer` wrapper class a `group` and add `transition-transform duration-700 ease-out-expo group-hover:scale-103` to the Image className.

4. `src/components/ValueProps.tsx`:
   - Replace `font-[family-name:var(--font-heading)]` with `font-heading` (lines 108, 160).
   - Correct arbitrary opacities to decimal brackets:
     - `bg-emerald-deep/8` -> `bg-emerald-deep/[0.08]`
     - `bg-emerald-mid/8` -> `bg-emerald-mid/[0.08]`
     - `bg-sage/8 border border-sage/12` -> `bg-sage/[0.08] border border-sage/[0.12]`
     - `bg-gold-muted/10` -> `bg-gold-muted/[0.10]`
     - `bg-sage/10` -> `bg-sage/[0.10]`
   - Apply `font-body` to the section description (`line 117`) and card body texts (`line 169`).
   - Copywriting changes:
     - Elevate section header: change "Por que a Titanium é a sua melhor escolha?" to "A inteligência financeira aplicada à sua próxima aquisição."
     - Elevate cards:
       - Card 1: "Segurança Jurídica Total" -> "Diligência Jurídica Prévia". Description: "Todas as cotas do nosso acervo passam por auditoria jurídica de compliance rigorosa e independente, eliminando qualquer risco de cessão."
       - Card 2: "Agilidade na Liberação" -> "Celeridade na Cessão". Description: "Processos homologados e estruturados para garantir a transferência célere do saldo credor, viabilizando sua compra sem delongas burocráticas."
       - Card 3: "Menores Taxas do Mercado" -> "Inteligência Tarifária". Description: "Negociamos cotas de alta performance com taxas de administração mínimas, representando uma economia real incomparável ao financiamento tradicional."
       - Card 4: "Suporte Executivo VIP" -> "Assessoria Concierge". Description: "Atendimento sob medida conduzido por especialistas especializados em engenharia financeira e direito regulatório."
   - Scale transition to card icons on hover: add `group-hover:scale-105 transition-transform duration-500 ease-out-expo` to the icon wrappers inside the card maps.
   - Implement a subtle background glow overlay inside the cards on hover (absolute div with transition).

5. `src/components/Segments.tsx`:
   - Replace `font-[family-name:var(--font-heading)]` with `font-heading` (lines 83, 138).
   - Replace `bg-emerald-deep text-white` with `bg-cta-bg text-cta-text` for card CTAs.
   - Correct opacity: `border-gold-muted/15` -> `border-gold-muted/[0.15]`, `bg-gold-muted/10` -> `bg-gold-muted/[0.10]`, `iconBg: "bg-emerald-deep/10"` -> `iconBg: "bg-emerald-deep/[0.10]"`, `iconBg: "bg-gold-muted/10"` -> `iconBg: "bg-gold-muted/[0.10]"`.
   - Apply `font-body` to descriptions and subtitles.
   - Copywriting changes:
     - Elevate section header: "Escolha seu caminho" -> "Portfólio de Ativos e Oportunidades".
     - Elevate Imóveis segment:
       - Subtitle: "Residências de alto padrão, imóveis comerciais e corporativos."
       - Description: "Cotas pré-aprovadas destinadas a aquisição ou incorporação de imóveis residenciais premium e galpões comerciais."
     - Elevate Veículos segment:
       - Subtitle: "Automóveis premium, frotas corporativas e embarcações."
       - Description: "Acesso à liquidez imediata para aquisição de frotas executivas ou veículos de alta performance com planejamento inteligente."
     - Card CTA button: change "Explorar Segmento" to "Acessar Portfólio".
   - Scale transition on card SVG icon's parent wrapper on hover.

6. `src/components/About.tsx`:
   - Replace `font-[family-name:var(--font-heading)]` with `font-heading` (line 81).
   - Replace `bg-emerald-deep/8` with `bg-emerald-deep/[0.08]` (line 71).
   - Replace button colors with `bg-cta-bg text-cta-text` and `hover:bg-cta-hover` (line 141-143).
   - Stats chips (lines 115-130):
     - Wrap each stat chip inside `bezel-outer group` and `bezel-inner` to implement the double bezel language.
     - Map background/borders of stats chips to semantic colors: `bg-card-bg/80 border border-card-border` instead of `bg-warm-white/80 border-charcoal/[0.04]`.
   - Apply `font-body` to the paragraphs and chip text.
   - Copywriting changes:
     - Eyebrow: "Sobre a Titanium" -> "A Essência Titanium".
     - Title: "Unindo experiência e inovação" -> "Tradição em segurança, excelência em resultados."
     - Paragraph 1: "A Titanium Consultoria nasceu para transformar..." -> "A Titanium estabeleceu-se como referência na viabilização de ativos de alto padrão. Guiados por um compromisso inegociável com a segurança jurídica e a ética regulatória, estruturamos processos proprietários de due diligence que garantem liquidez real e total transparência aos nossos clientes."
     - Paragraph 2: "Nossa equipe jurídica audita cada carta..." -> "Nosso conselho jurídico interno audita exaustivamente o histórico de cada cota de crédito antes de sua inclusão em nosso acervo, garantindo transações de cessão seguras e em total conformidade com as regras do Banco Central do Brasil."
     - Stats chip labels:
       - "Suporte Jurídico In-house" -> "Diligência Jurídica Interna"
       - "Melhores Administradoras" -> "Cotas Homologadas pelo BACEN"
       - "Taxas de Juros Zero" -> "Isenção de Juros Reais"
       - "Atendimento VIP" -> "Assessoria Personalizada Concierge"
     - Button: change "Falar com Consultor" to "Agendar Consultoria".
   - Add hover scale zoom on the about team photo (`group-hover:scale-103`).

7. `src/components/Footer.tsx`:
   - Replace standard white opacities with semantic cream variables on a dark background:
     - Social link wrappers (`line 118`): `bg-white/[0.06] border border-white/[0.08]` -> `bg-cream/[0.05] border border-cream/[0.08]`.
     - Social hover background: `hover:bg-white/10` -> `hover:bg-cream/10`.
     - Bottom border (`line 131`): `border-white/[0.06]` -> `border-cream/[0.06]`.
   - Add explicit `font-body` to paragraph and links.
   - Copywriting & Compliance:
     - Description: change "Líder em cartas de crédito contempladas..." to "Autoridade em intermediação de cartas de crédito contempladas. Aliando o mais alto padrão de compliance jurídico a um ecossistema de atendimento individualizado."
     - Add legal disclaimer to bottom bar (above copyrights):
       "A Titanium Consultoria atua exclusivamente como intermediária e assessoria independente na cessão e transferência de cotas de consórcios previamente contratadas junto a administradoras autorizadas pelo Banco Central do Brasil. Não somos instituição financeira ou administradora de consórcios."
     - Style CNPJ with `font-body`.

8. `src/components/WhatsAppFAB.tsx`:
   - Refactor from the hardcoded WhatsApp green `#25D366` to `bg-whatsapp`.
   - Update pulse ring bg to `bg-whatsapp/40`.
   - Tooltip background: replace `bg-charcoal` (lines 51, 62) with `bg-cream border border-card-border text-charcoal` and add border-r, border-t to the arrow to make it look like a luxury card tag.
   - Apply `font-body` to the tooltip text.
   - Tooltip text: change "Fale conosco" to "Assessoria Exclusiva".
   - Refine tooltip transition to fade up and slide from right smoothly (`ease-out-expo`).

9. Validation:
   - Once all edits are complete, run `npm run build` and `npm run lint` inside the project directory to verify that everything compiles correctly.
   - Save the results and a detailed summary of changes to a handoff report at: `C:\Users\Pichau\.gemini\antigravity\brain\1e3cdc9c-7978-4188-8a9b-25ab01f4bdf7\worker_m2_handoff.md`.
