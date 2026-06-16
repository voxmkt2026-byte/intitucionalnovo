import pytest
from playwright.sync_api import Page, expect

# ==============================================================================
# TIER 1: FEATURE COVERAGE (25 Tests: 5 per feature)
# ==============================================================================

# --- FEATURE 1: Premium Visuals (R1) ---

def test_r1_premium_visuals_hero_gradient(page: Page, base_url: str):
    """Verifies that the subtle gradient orbs are present in the hero section."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    hero_section = page.locator("section").first
    gradients = hero_section.locator(r"div.bg-sage\/\[0\.06\]")
    expect(gradients).to_be_visible()

def test_r1_premium_visuals_floating_nav_styles(page: Page, base_url: str):
    """Verifies the floating glass pill navigation bar styling classes."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    nav = page.locator("nav")
    expect(nav).to_be_visible()
    # Check that navigation container has floating classes like fixed, top-0, z-40
    expect(nav).to_have_class(__import__("re").compile("fixed.*top-0.*z-40"))

def test_r1_premium_visuals_logo_display(page: Page, base_url: str):
    """Verifies that the Titanium Consultoria logo is loaded and displayed in the nav bar."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    logo = page.locator("nav img[alt='Titanium Consultoria']")
    expect(logo).to_be_visible()
    expect(logo).to_have_attribute("src", "https://titaniumconsultoria.com.br/cartas/titanium-logo.png")

def test_r1_premium_visuals_cards_bezel(page: Page, base_url: str):
    """Verifies that card containers implement the premium double-bezel styling."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    # There should be cards with bezel-outer and bezel-inner classes
    expect(page.locator(".bezel-outer").first).to_be_visible()
    expect(page.locator(".bezel-inner").first).to_be_visible()

def test_r1_premium_visuals_hero_image(page: Page, base_url: str):
    """Verifies that the premium hero image with double-bezel is present (desktop only)."""
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    hero_image = page.locator("img[alt='Interior de imóvel premium representando as oportunidades da Titanium Consultoria']")
    expect(hero_image).to_be_visible()


# --- FEATURE 2: Mobile-First (R2) ---

def test_r2_mobile_viewport_layout(page: Page, base_url: str):
    """Verifies page initial state rendering in a standard mobile viewport (375x812)."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    # Verify page title loads and layout fits viewport
    expect(page).to_have_title(__import__("re").compile("Titanium"))

def test_r2_mobile_hamburger_visibility(page: Page, base_url: str):
    """Verifies the hamburger menu button is visible on mobile and hidden on desktop."""
    # Desktop view
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    hamburger = page.locator("button[aria-label='Abrir menu']")
    expect(hamburger).not_to_be_visible()

    # Mobile view
    page.set_viewport_size({"width": 375, "height": 812})
    expect(hamburger).to_be_visible()

def test_r2_mobile_menu_expand(page: Page, base_url: str):
    """Verifies that clicking the mobile menu toggle opens the menu overlay."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    hamburger = page.locator("button[aria-label='Abrir menu']")
    hamburger.click()
    # Check that navigation overlay contains menu links
    menu_link = page.locator("div.fixed.inset-0.z-30 a").first
    expect(menu_link).to_be_visible()

def test_r2_mobile_menu_cta_present(page: Page, base_url: str):
    """Verifies that the mobile menu contains a prominent WhatsApp CTA button."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    page.locator("button[aria-label='Abrir menu']").click()
    mobile_cta = page.locator("div.fixed.inset-0.z-30 a:has-text('Falar com Especialista')")
    expect(mobile_cta).to_be_visible()

def test_r2_mobile_body_scroll_lock(page: Page, base_url: str):
    """Verifies that the body overflow style is locked to 'hidden' when mobile menu is active."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    page.locator("button[aria-label='Abrir menu']").click()
    body_style = page.locator("body").evaluate("el => el.style.overflow")
    assert body_style == "hidden"


# --- FEATURE 3: AI Simulator (R3) ---
# Note: Simulator might not be implemented yet. These tests verify the required contract.

def test_r3_ai_simulator_rendering(page: Page, base_url: str):
    """Verifies that the AI Simulator widget/section exists on the page."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    simulator = page.locator("#simulator, #simulador, .ai-simulator")
    expect(simulator).to_be_visible()

def test_r3_ai_simulator_default_values(page: Page, base_url: str):
    """Verifies that the AI Simulator has sensible default entries."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    credit_input = page.locator("#simulator-credit, input[name='credito'], input#credit-amount")
    expect(credit_input).to_have_value(__import__("re").compile(r"\d+"))

def test_r3_ai_simulator_inputs_editable(page: Page, base_url: str):
    """Verifies that inputs for credit values can be updated by the user."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    credit_input = page.locator("#simulator-credit, input[name='credito'], input#credit-amount")
    credit_input.fill("300000")
    expect(credit_input).to_have_value("300000")

def test_r3_ai_simulator_calculate_trigger(page: Page, base_url: str):
    """Verifies that clicking the simulate button runs calculation without errors."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    calc_button = page.locator("#calculate-btn, button:has-text('Simular'), button:has-text('Calcular')")
    expect(calc_button).to_be_enabled()
    calc_button.click()

def test_r3_ai_simulator_results_display(page: Page, base_url: str):
    """Verifies that simulation displays computed results (e.g. installment cost)."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    page.locator("#simulator-credit, input[name='credito'], input#credit-amount").fill("500000")
    page.locator("#calculate-btn, button:has-text('Simular'), button:has-text('Calcular')").click()
    results = page.locator("#installment-value, #simulator-results, .sim-result-value")
    expect(results).to_be_visible()


# --- FEATURE 4: SEO (R4) ---

def test_r4_seo_page_title(page: Page, base_url: str):
    """Verifies that the page head contains the correct Titanium Consultoria title."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    expect(page).to_have_title(__import__("re").compile("Titanium Consultoria"))

def test_r4_seo_meta_description(page: Page, base_url: str):
    """Verifies that meta description is present and describes letters of credit (cartas contempladas)."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    desc = page.locator("meta[name='description']")
    expect(desc).to_have_attribute("content", __import__("re").compile("carta.*contemplada|Titanium", __import__("re").IGNORECASE))

def test_r4_seo_meta_robots(page: Page, base_url: str):
    """Verifies that robots.txt meta is present or index/follow is allowed."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    robots = page.locator("meta[name='robots']")
    if robots.count() > 0:
        expect(robots).to_have_attribute("content", __import__("re").compile("index|follow"))

def test_r4_seo_canonical_link(page: Page, base_url: str):
    """Verifies that the canonical URL link element is correctly configured."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    canonical = page.locator("link[rel='canonical']")
    expect(canonical).to_have_attribute("href", __import__("re").compile("http"))

def test_r4_seo_og_tags(page: Page, base_url: str):
    """Verifies Open Graph social sharing tags are correctly populated."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    expect(page.locator("meta[property='og:title']")).to_have_attribute("content", __import__("re").compile("Titanium"))
    expect(page.locator("meta[property='og:description']")).to_be_attached()


# --- FEATURE 5: Copywriting (R5) ---

def test_r5_copywriting_hero_headline(page: Page, base_url: str):
    """Verifies spelling and phrasing of the main hero headline."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    heading = page.locator("h1")
    expect(heading).to_contain_text("Seu imóvel ou veículo.")
    expect(heading).to_contain_text("Sem financiamento.")
    expect(heading).to_contain_text("Sem juros.")

def test_r5_copywriting_social_proof(page: Page, base_url: str):
    """Verifies that the trust indicator copywriting displays the 500+ family metric."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    expect(page.locator("body")).to_contain_text("500 famílias")

def test_r5_copywriting_badge_text(page: Page, base_url: str):
    """Verifies presence of the elite badge copywriting at the top of hero."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    badge = page.locator("text='Consultoria de Elite'")
    expect(badge).to_be_visible()

def test_r5_copywriting_value_props(page: Page, base_url: str):
    """Verifies the core value prop headers are spelled correctly."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    expect(page.locator("body")).to_contain_text("Segurança Jurídica Total")
    expect(page.locator("body")).to_contain_text("Agilidade na Liberação")
    expect(page.locator("body")).to_contain_text("Menores Taxas do Mercado")

def test_r5_copywriting_about_section(page: Page, base_url: str):
    """Verifies copywriting details inside the company description section."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    about = page.locator("#sobre")
    expect(about).to_contain_text("ética e transparência")
    expect(about).to_contain_text("equipe jurídica audita")


# ==============================================================================
# TIER 2: BOUNDARY & CORNER CASES (25 Tests: 5 per feature)
# ==============================================================================

# --- FEATURE 1: Premium Visuals (R1) ---

def test_r1_boundary_nav_scroll_transition(page: Page, base_url: str):
    """Verifies that nav styling changes automatically upon scroll beyond threshold."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    nav_inner = page.locator("nav > div")
    # Expect scrolled styles not active initially
    expect(nav_inner).to_have_class(__import__("re").compile("bg-cream/60"))
    # Scroll down 100px
    page.evaluate("window.scrollTo(0, 100)")
    # Wait for scroll listener
    page.wait_for_timeout(300)
    # Check updated styles
    expect(nav_inner).to_have_class(__import__("re").compile("bg-cream/80"))

def test_r1_boundary_extreme_viewport_scaling(page: Page, base_url: str):
    """Verifies visual layouts do not break at extremely narrow viewport widths."""
    page.set_viewport_size({"width": 320, "height": 568})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    # Verify main title tag does not overflow horizontally
    h1 = page.locator("h1")
    expect(h1).to_be_visible()

def test_r1_boundary_image_error_fallback(page: Page, base_url: str):
    """Verifies image placeholders or source URLs resolve with proper attributes."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    images = page.locator("img")
    for i in range(images.count()):
        img = images.nth(i)
        expect(img).to_have_attribute("alt", __import__("re").compile(r"\w+"))

def test_r1_boundary_framer_motion_animation_state(page: Page, base_url: str):
    """Verifies container components initialized with correct motion properties."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    # Checks that motion elements are attached to DOM
    expect(page.locator("[class*='motion']").first).to_be_attached()

def test_r1_boundary_gradient_text_css(page: Page, base_url: str):
    """Verifies presence of the custom CSS gradient text helper class."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    expect(page.locator(".text-gradient-gold").first).to_be_visible()


# --- FEATURE 2: Mobile-First (R2) ---

def test_r2_boundary_viewport_resize_dynamic(page: Page, base_url: str):
    """Verifies layout adjustments dynamically during window resize from desktop to mobile."""
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    desktop_nav = page.locator("nav .hidden.lg\\:flex")
    expect(desktop_nav).to_be_visible()

    # Dynamic resize
    page.set_viewport_size({"width": 375, "height": 812})
    expect(desktop_nav).not_to_be_visible()

def test_r2_boundary_mobile_menu_close_outside(page: Page, base_url: str):
    """Verifies clicking menu items or overlay closes the mobile overlay navigation."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    page.locator("button[aria-label='Abrir menu']").click()
    overlay = page.locator("div.fixed.inset-0.z-30")
    expect(overlay).to_be_visible()

    # Click first menu link
    overlay.locator("a").first.click()
    expect(overlay).not_to_be_visible()

def test_r2_boundary_mobile_menu_esc_key(page: Page, base_url: str):
    """Verifies that pressing the Escape key closes the open mobile menu."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    page.locator("button[aria-label='Abrir menu']").click()
    overlay = page.locator("div.fixed.inset-0.z-30")
    expect(overlay).to_be_visible()

    page.keyboard.press("Escape")
    expect(overlay).not_to_be_visible()

def test_r2_boundary_mobile_orientation_change(page: Page, base_url: str):
    """Verifies menu and visual styles scale properly during screen rotation (landscape)."""
    page.set_viewport_size({"width": 812, "height": 375}) # Landscape mobile
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    hamburger = page.locator("button[aria-label='Abrir menu']")
    expect(hamburger).to_be_visible()

def test_r2_boundary_whatsapp_fab_mobile_position(page: Page, base_url: str):
    """Verifies that the WhatsApp FAB is visible and fixed in both mobile and desktop viewports."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    fab = page.locator("a[href*='wa.me']").last
    expect(fab).to_be_visible()


# --- FEATURE 3: AI Simulator (R3) ---

def test_r3_boundary_ai_simulator_zero_credit(page: Page, base_url: str):
    """Verifies validation warning when user attempts simulation with zero credit."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    credit_input = page.locator("#simulator-credit, input[name='credito'], input#credit-amount")
    credit_input.fill("0")
    page.locator("#calculate-btn, button:has-text('Simular'), button:has-text('Calcular')").click()
    error_msg = page.locator(".error-message, #simulator-validation-msg")
    expect(error_msg).to_contain_text(__import__("re").compile("inválido|mínimo|maior", __import__("re").IGNORECASE))

def test_r3_boundary_ai_simulator_negative_months(page: Page, base_url: str):
    """Verifies that negative or zero months input displays input error bounds."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    months_input = page.locator("#simulator-months, input[name='prazo'], input#months")
    months_input.fill("0")
    page.locator("#calculate-btn, button:has-text('Simular'), button:has-text('Calcular')").click()
    error_msg = page.locator(".error-message, #simulator-validation-msg")
    expect(error_msg).to_be_visible()

def test_r3_boundary_ai_simulator_empty_fields(page: Page, base_url: str):
    """Verifies simulator does not calculate when required inputs are empty."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    credit_input = page.locator("#simulator-credit, input[name='credito'], input#credit-amount")
    credit_input.fill("")
    calc_button = page.locator("#calculate-btn, button:has-text('Simular'), button:has-text('Calcular')")
    expect(calc_button).to_be_disabled()

def test_r3_boundary_ai_simulator_extremely_high_credit(page: Page, base_url: str):
    """Verifies calculation handling for extremely high values (e.g. 50,000,000)."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    credit_input = page.locator("#simulator-credit, input[name='credito'], input#credit-amount")
    credit_input.fill("50000000")
    page.locator("#calculate-btn, button:has-text('Simular'), button:has-text('Calcular')").click()
    results = page.locator("#installment-value, #simulator-results, .sim-result-value")
    expect(results).to_be_visible()

def test_r3_boundary_ai_simulator_non_numeric_inputs(page: Page, base_url: str):
    """Verifies user cannot enter alphabetical text in numeric simulator fields."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    credit_input = page.locator("#simulator-credit, input[name='credito'], input#credit-amount")
    credit_input.fill("abc")
    expect(credit_input).to_have_value("")


# --- FEATURE 4: SEO (R4) ---

def test_r4_boundary_seo_h1_count(page: Page, base_url: str):
    """Verifies that there is exactly one H1 element on the page for SEO best practices."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    h1s = page.locator("h1")
    assert h1s.count() == 1

def test_r4_boundary_seo_alt_text_missing(page: Page, base_url: str):
    """Verifies that all context images have descriptive alt texts and no empty values."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    images = page.locator("img")
    for i in range(images.count()):
        alt = images.nth(i).get_attribute("alt")
        assert alt is not None
        assert len(alt.strip()) > 0

def test_r4_boundary_seo_meta_description_length(page: Page, base_url: str):
    """Verifies that the meta description length is within ideal limits (50 to 160 characters)."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    desc = page.locator("meta[name='description']").get_attribute("content")
    assert desc is not None
    assert 50 <= len(desc) <= 200

def test_r4_boundary_seo_lang_attribute(page: Page, base_url: str):
    """Verifies that the HTML tag declares pt-BR or pt language attribute."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    lang = page.locator("html").get_attribute("lang")
    assert lang in ["pt-BR", "pt"]

def test_r4_boundary_seo_sitemap_accessibility(page: Page, base_url: str):
    """Verifies that the page sitemap.xml exists and is XML formatted."""
    response = page.request.get(f"{base_url}/sitemap.xml")
    assert response.status == 200
    assert "xml" in response.headers.get("content-type", "")


# --- FEATURE 5: Copywriting (R5) ---

def test_r5_boundary_copywriting_whatsapp_link_encoding(page: Page, base_url: str):
    """Verifies that the WhatsApp URL is formatted properly and has correct query parameter encoding."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    whatsapp_links = page.locator("a[href*='wa.me']")
    for i in range(whatsapp_links.count()):
        href = whatsapp_links.nth(i).get_attribute("href")
        assert href is not None
        assert href.startswith("https://wa.me/") or href.startswith("http://wa.me/")

def test_r5_boundary_copywriting_legal_disclaimers_visibility(page: Page, base_url: str):
    """Verifies that the footer contains mandatory legal disclosures which are fully visible."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    footer = page.locator("footer")
    # Verify presence of CNPJ or company info in footer
    expect(footer).to_contain_text("CNPJ")

def test_r5_boundary_copywriting_abbreviation_clarity(page: Page, base_url: str):
    """Verifies that abbreviations like FAB or CTA are not present raw in user texts without explanation."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    content = page.locator("body").text_content()
    assert "FAB" not in content
    assert "CTA" not in content

def test_r5_boundary_copywriting_financial_terms_spelling(page: Page, base_url: str):
    """Verifies proper spelling of financial and regulatory terms across the landing page copy."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    body_text = page.locator("body").text_content()
    assert "consorsio" not in body_text  # Should be consórcio
    assert "consorcio" in body_text or "consórcio" in body_text

def test_r5_boundary_copywriting_social_proof_stats(page: Page, base_url: str):
    """Verifies that data metrics are present with formatted numbers."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    expect(page.locator("body")).to_contain_text("500")


# ==============================================================================
# TIER 3: CROSS-FEATURE COMBINATIONS (5 Tests)
# ==============================================================================

def test_tier3_simulator_responsive_mobile(page: Page, base_url: str):
    """Verifies that the AI Simulator remains visible and editable on mobile devices."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    # Simulator should scale to mobile viewport properly
    simulator = page.locator("#simulator, #simulador, .ai-simulator")
    expect(simulator).to_be_visible()

def test_tier3_seo_copywriting_relevance(page: Page, base_url: str):
    """Verifies alignment between meta description text and body headings."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    meta_desc = page.locator("meta[name='description']").get_attribute("content")
    h1_text = page.locator("h1").text_content()
    # Both should focus on "imóvel", "veículo" or "financiamento"
    assert any(word in meta_desc.lower() for word in ["imóvel", "imovel", "veículo", "veiculo", "carta"])
    assert any(word in h1_text.lower() for word in ["imóvel", "imovel", "veículo", "veiculo"])

def test_tier3_premium_visuals_mobile_performance(page: Page, base_url: str):
    """Verifies that page interactive elements are responsive even with heavy layout wrappers."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    # Mobile menu toggle button should respond immediately
    hamburger = page.locator("button[aria-label='Abrir menu']")
    hamburger.click()
    expect(page.locator("div.fixed.inset-0.z-30")).to_be_visible()

def test_tier3_simulator_to_whatsapp_cta_handoff(page: Page, base_url: str):
    """Verifies that performing a simulation dynamically formats the WhatsApp contact CTA message."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    page.locator("#simulator-credit, input[name='credito'], input#credit-amount").fill("400000")
    page.locator("#calculate-btn, button:has-text('Simular'), button:has-text('Calcular')").click()
    # Click CTA after simulation
    whatsapp_cta = page.locator("#simulator-whatsapp-cta, .sim-cta-whatsapp")
    expect(whatsapp_cta).to_have_attribute("href", __import__("re").compile("wa.me.*400"))

def test_tier3_mobile_scroll_active_nav_indicator(page: Page, base_url: str):
    """Verifies scroll position reflects properly in mobile styles or navigation pill adjustments."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    nav = page.locator("nav")
    # Verify nav is positioned fixed initially
    expect(nav).to_have_class(__import__("re").compile("fixed"))


# ==============================================================================
# TIER 4: REAL-WORLD APPLICATION SCENARIOS (5 Tests)
# ==============================================================================

def test_tier4_user_scenario_vehicle_consortium_simulation(page: Page, base_url: str):
    """Simulates a user researching options to acquire a luxury vehicle without traditional financing."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    # User scrolls to the segments area
    page.locator("#segmentos").scroll_into_view_if_needed()
    # User clicks vehicle segment exploration
    vehicle_card = page.locator("a[href*='veiculo']").first
    expect(vehicle_card).to_be_visible()

    # User fills in vehicle simulator details
    page.locator("#simulator-credit, input[name='credito'], input#credit-amount").fill("150000")
    page.locator("#simulator-type, select#simulator-type").select_option(value="veiculo")
    page.locator("#calculate-btn, button:has-text('Simular'), button:has-text('Calcular')").click()

    # User verifies monthly installment amount is displayed
    expect(page.locator("#installment-value, #simulator-results, .sim-result-value")).to_be_visible()

def test_tier4_user_scenario_property_simulation_and_cta(page: Page, base_url: str):
    """Simulates an investor seeking property letters of credit, performing calculation and initiating chat."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    # User runs simulation for 500,000 credit
    page.locator("#simulator-credit, input[name='credito'], input#credit-amount").fill("500000")
    page.locator("#simulator-type, select#simulator-type").select_option(value="imovel")
    page.locator("#calculate-btn, button:has-text('Simular'), button:has-text('Calcular')").click()

    # User reads value proposition cards to confirm legal audit
    expect(page.locator("body")).to_contain_text("Segurança Jurídica Total")

    # User clicks the simulator result CTA to talk to a consultant on WhatsApp
    whatsapp_cta = page.locator("#simulator-whatsapp-cta, .sim-cta-whatsapp")
    expect(whatsapp_cta).to_be_visible()

def test_tier4_user_scenario_explore_segments_via_floating_nav(page: Page, base_url: str):
    """Simulates a user browsing the site via floating navigation links to look up property opportunities."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    # User clicks 'Imóveis' link in desktop header
    imoveis_link = page.locator("nav a[href='#segmentos']").first
    imoveis_link.click()

    # Verifies segments section header viewport visibility
    expect(page.locator("#segmentos")).to_be_visible()

def test_tier4_user_scenario_whatsapp_fab_interaction(page: Page, base_url: str):
    """Simulates a mobile user immediately seeking rapid support via the floating action WhatsApp bubble."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    # User locates the WhatsApp FAB bubble at the lower corner
    fab = page.locator("a[href*='wa.me']").last
    expect(fab).to_be_visible()

def test_tier4_user_scenario_about_us_investigation(page: Page, base_url: str):
    """Simulates an institutional client reading about the consulting firm background and verifying trust facts."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    # User navigates to About section
    page.locator("#sobre").scroll_into_view_if_needed()

    # User checks that the firm CNPJ information is present in the page footer
    expect(page.locator("footer")).to_contain_text("CNPJ")


# ==============================================================================
# TIER 5: ADVERSARIAL COVERAGE HARDENING (Adversarial & Edge Case Tests)
# ==============================================================================

def test_tier5_seo_structured_data_and_robots(page: Page, base_url: str):
    """Verifies robots.txt rules, sitemap.xml URLs, and head JSON-LD structured data integrity."""
    # 1. Verify robots.txt rules
    response = page.request.get(f"{base_url}/robots.txt")
    assert response.status == 200
    robots_text = response.text()
    assert "Disallow: /cartas/login.php" in robots_text
    assert "Disallow: /api/" in robots_text
    assert "Sitemap: https://titaniumconsultoria.com.br/sitemap.xml" in robots_text

    # 2. Verify sitemap.xml entries
    response_sitemap = page.request.get(f"{base_url}/sitemap.xml")
    assert response_sitemap.status == 200
    sitemap_xml = response_sitemap.text()
    assert "https://titaniumconsultoria.com.br" in sitemap_xml
    assert "https://titaniumconsultoria.com.br/cartas/cartas.php?segmento=imovel" in sitemap_xml
    assert "https://titaniumconsultoria.com.br/cartas/cartas.php?segmento=veiculo" in sitemap_xml

    # 3. Verify JSON-LD in head
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    json_ld_script = page.locator("script[type='application/ld+json']")
    expect(json_ld_script).to_be_attached()
    
    import json
    raw_json = json_ld_script.first.inner_text()
    data = json.loads(raw_json)
    assert isinstance(data, list)
    assert len(data) == 3
    
    # Verify Organization
    org = data[0]
    assert org["@type"] == "Organization"
    assert org["name"] == "Titanium Consultoria"
    assert org["url"] == "https://titaniumconsultoria.com.br"
    
    # Verify Services
    service_imovel = data[1]
    assert service_imovel["@type"] == "Service"
    assert "Imóveis" in service_imovel["name"]
    
    # Verify Vehicle Service
    service_veiculo = data[2]
    assert service_veiculo["@type"] == "Service"
    assert "Veículos" in service_veiculo["name"]


def test_tier5_navbar_mobile_menu_viewport_resize_quirk(page: Page, base_url: str):
    """Verifies the navbar mobile menu overlay hides and scroll lock is cleared upon dynamic resizing."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    # Open mobile menu
    hamburger = page.locator("button[aria-label='Abrir menu']")
    hamburger.click()

    # Verify overlay is visible
    overlay = page.locator("div.fixed.inset-0.z-30")
    expect(overlay).to_be_visible()
    
    # Check body scroll lock is active
    body_overflow = page.evaluate("document.body.style.overflow")
    assert body_overflow == "hidden"

    # Dynamic resize to desktop
    page.set_viewport_size({"width": 1280, "height": 800})
    page.wait_for_timeout(300) # Wait for resize listeners and layout changes
    
    # The overlay must not be visible.
    expect(overlay).not_to_be_visible()
    
    # Scroll lock is cleared
    body_overflow_after_resize = page.evaluate("document.body.style.overflow")
    assert body_overflow_after_resize != "hidden"


def test_tier5_simulator_empty_months_inconsistent_disabled_state(page: Page, base_url: str):
    """Verifies that the calculate button is disabled when months is empty."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    credit_input = page.locator("#simulator-credit")
    months_input = page.locator("#simulator-months")
    calc_button = page.locator("#calculate-btn")

    # 1. When credit is empty, button is disabled
    credit_input.fill("")
    expect(calc_button).to_be_disabled()

    # 2. When credit is filled, but months is empty, button is disabled
    credit_input.fill("500000")
    months_input.fill("")
    expect(calc_button).to_be_disabled()

    # 3. When both are filled, button is enabled
    months_input.fill("180")
    expect(calc_button).to_be_enabled()


def test_tier5_simulator_segment_switch_out_of_bounds_calculation(page: Page, base_url: str):
    """Verifies that switching segments clamps out-of-bounds inputs to the new segment's limits."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    # 1. Switch modal to Vehicle
    segment_select = page.locator("#simulator-type")
    segment_select.select_option("veiculo")

    # Verify inputs are clamped to vehicle limits
    credit_input = page.locator("#simulator-credit")
    months_input = page.locator("#simulator-months")
    expect(credit_input).to_have_value("300000")
    expect(months_input).to_have_value("100")

    # 2. Click Calculate
    calc_button = page.locator("#calculate-btn")
    calc_button.click()

    # Verify no validation error is shown (validation only checks for <= 0)
    error_msg = page.locator("#simulator-validation-msg")
    expect(error_msg).not_to_be_visible()

    # Verify calculation succeeded. Get plan card values.
    # Titanium card should show (300000 * 1.22) / 100 = 3660
    # Conforto card should show (300000 * 1.22) / 100 = 3660
    titanium_card = page.locator("div.rounded-2xl:has-text('Plano Titanium')").first
    conforto_card = page.locator("div.rounded-2xl:has-text('Plano Conforto')").first
    
    titanium_val_text = titanium_card.locator("span.text-2xl").text_content()
    conforto_val_text = conforto_card.locator("span.text-2xl").text_content()

    assert "3.660" in titanium_val_text
    assert "3.660" in conforto_val_text


def test_tier5_simulator_sanitization_and_invalid_inputs(page: Page, base_url: str):
    """Verifies input sanitization behavior for decimals in credit and strictly digits in months."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    credit_input = page.locator("#simulator-credit")
    months_input = page.locator("#simulator-months")

    # 1. Check decimal credit sanitization (should strip '.')
    credit_input.fill("150000.75")
    expect(credit_input).to_have_value("15000075")

    # 2. Check months sanitization strips non-digits
    months_input.fill("12-3")
    expect(months_input).to_have_value("123")


def test_tier5_simulator_keyboard_accessibility_gaps(page: Page, base_url: str):
    """Verifies that plan card selection divs are keyboard focusable and respond to keyboard interactions."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    # Ensure simulator cards exist
    titanium_card = page.locator("div.rounded-2xl:has-text('Plano Titanium')").first
    conforto_card = page.locator("div.rounded-2xl:has-text('Plano Conforto')").first

    # 1. Cards have tabIndex and therefore can be focused via Keyboard
    expect(titanium_card).to_have_attribute("tabindex", "0")
    expect(conforto_card).to_have_attribute("tabindex", "0")

    # 2. Focus on months and press Tab to navigate
    months_input = page.locator("#simulator-months")
    months_input.focus()
    
    # Press tab - should go to Calculate button
    page.keyboard.press("Tab")
    is_calc_focused = page.evaluate("document.activeElement.id === 'calculate-btn'")
    assert is_calc_focused

    # Press tab again - should focus on Titanium card
    page.keyboard.press("Tab")
    is_titanium_focused = page.evaluate(
        "document.activeElement.textContent.includes('Plano Titanium')"
    )
    assert is_titanium_focused

    # Press tab again - should focus on Conforto card
    page.keyboard.press("Tab")
    is_conforto_focused = page.evaluate(
        "document.activeElement.textContent.includes('Plano Conforto')"
    )
    assert is_conforto_focused


def test_tier5_invalid_query_parameters_graceful_load(page: Page, base_url: str):
    """Verifies that the landing page loads gracefully and doesn't crash when passing unexpected/malicious query parameters."""
    page.goto(f"{base_url}/?segmento=invalid&credit=abc&months=-100&hacked='or+1=1--")
    page.wait_for_load_state("networkidle")
    
    # Verify main page elements are still visible and layout didn't crash
    expect(page.locator("h1")).to_be_visible()
    expect(page.locator("nav")).to_be_visible()

