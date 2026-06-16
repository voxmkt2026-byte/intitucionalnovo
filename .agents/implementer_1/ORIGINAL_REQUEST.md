## 2026-06-11T22:26:39Z

You are the Code Implementer for the Titanium landing page project.
Your workspace is the codebase directory: C:\Users\Pichau\.gemini\antigravity\scratch\titanium-landing\.

### Integrity Warning:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your task is to implement the following changes in the codebase and run verification commands:

1. **Fix Navbar Mobile Menu Resize Bug**:
   - In `src/components/Navbar.tsx`:
     - Add a window resize event listener inside a `useEffect` hook. When the window width becomes `>= 1024px` (desktop breakpoint), set `isOpen` to `false` and clear the body scroll lock: `document.body.style.overflow = "unset"`.
     - Add the `lg:hidden` utility class to the mobile menu overlay container (around line 162) to ensure it hides automatically on desktop viewports.

2. **Fix Simulator Calculate Button Inconsistent Disabled State**:
   - In `src/components/ParcelSimulator.tsx`:
     - Update the calculate button disable logic (`isCalculateDisabled`) to check if either `credit === ""` OR `months === ""` is true.

3. **Fix Simulator Segment Switch Bounds Calculation**:
   - In `src/components/ParcelSimulator.tsx`:
     - Update `handleSegmentChange` to clamp the current `credit` and `months` values to the new segment's limits:
       - For `veiculo`: Max credit is 300,000, max months is 100. If current values exceed these, clamp them to the max limits.
       - For `imovel`: Max credit is 500,000, max months is 220. If current values exceed these, clamp them to the max limits.

4. **Fix Simulator Input Sanitization**:
   - In `src/components/ParcelSimulator.tsx`:
     - In `handleMonthsChange`, update the sanitization logic to strictly allow only positive integer characters (digits `0-9`). Do not allow dashes `-` or other symbols. Use `e.target.value.replace(/[^0-9]/g, "")`.

5. **Fix Simulator Plan Card Keyboard Accessibility**:
   - In `src/components/ParcelSimulator.tsx`:
     - Add `tabIndex={0}`, `role="button"`, and an `onKeyDown` event handler (supporting `Space` and `Enter` key presses) to both plan cards (Titanium and Conforto).
     - Add outline/ring classes for visual focus indicators (`focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-deep focus-visible:ring-offset-2`) so keyboard users can see when cards are focused.

6. **Integrate the 7 Adversarial Test Cases**:
   - Append the following 7 test functions to the end of `tests/test_landing_page.py`:

```python
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
    titanium_card = page.locator("div:has-text('Plano Titanium')").filter(has_text="Parcela Estimada").first
    conforto_card = page.locator("div:has-text('Plano Conforto')").filter(has_text="Parcela Estimada").first
    
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
    titanium_card = page.locator("div:has-text('Plano Titanium')").filter(has_text="Parcela Estimada").first
    conforto_card = page.locator("div:has-text('Plano Conforto')").filter(has_text="Parcela Estimada").first

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
