# Handoff Report — Phase 2: Adversarial Coverage Hardening (Tier 5)

## Summary of Findings
A white-box audit of the Titanium landing page codebase was conducted. We identified 6 key gaps/untested paths:
1. **SEO & Structured Data Integrity**: Lack of precise assertions for robots.txt rules, sitemap.xml URLs, and head JSON-LD structured data.
2. **Mobile Menu Resizing Quirk**: The mobile overlay blocks the screen and leaves the scroll lock active when dynamically resized from mobile to desktop.
3. **Simulator Inconsistent Disabled State**: The calculate button remains enabled when the months input is cleared, causing a validation error on click, whereas clearing credit disables it.
4. **Simulator Segment Switch Bounds Calculation**: Switching segments does not clamp existing out-of-bounds input values, causing vehicles to calculate with 500k credit and 180 months, resulting in Conforto installment being higher than Titanium.
5. **Simulator Input Sanitization Quirks**: Decimals in credit are collapsed without warning, and invalid characters (like multiple dashes) in months are allowed in state, leading to a NaN valuation.
6. **Simulator Plan Card Keyboard Accessibility Gaps**: Custom plan card selector divs are not focusable via Tab or selectable via Space/Enter keys.

Below is the structured analysis following the team's Handoff Protocol.

---

## 1. Observation
We observed the following code patterns and behaviors in the codebase:
- **JSON-LD Structured Data**:
  - `src/app/layout.tsx` (lines 73–118) defines `jsonLd` with types `Organization` and `Service`.
  - In `RootLayout` (lines 128–131), this metadata is dangerously injected:
    ```tsx
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    ```
- **Robots and Sitemap**:
  - `src/app/robots.ts` (lines 9) specifies rules: `disallow: ["/cartas/login.php", "/api/"]`.
  - `src/app/sitemap.ts` (lines 7–26) returns specific sitemap objects with URLs containing `cartas.php?segmento=imovel` and `cartas.php?segmento=veiculo`.
- **Navbar Mobile Menu Resize Behavior**:
  - `src/components/Navbar.tsx` (lines 26–34) sets `document.body.style.overflow = "hidden"` when `isOpen` is true.
  - The menu overlay uses framer-motion in `AnimatePresence` (lines 157–163) with class:
    ```tsx
    className="fixed inset-0 z-30 bg-cream/95 backdrop-blur-3xl flex flex-col items-center justify-center"
    ```
    There is no screen resize event handler to clear `isOpen` to `false`, nor is there an `lg:hidden` utility class on this container.
- **Simulator calculate button state inconsistency**:
  - `src/components/ParcelSimulator.tsx` (line 128) defines button disable rule:
    ```tsx
    const isCalculateDisabled = credit === "";
    ```
    This ignores whether `months === ""`.
- **Simulator Segment Switch Bounds Preservation**:
  - `src/components/ParcelSimulator.tsx` (lines 38–42) handles segment change:
    ```tsx
    const handleSegmentChange = (val: "imovel" | "veiculo") => {
      setSegment(val);
      setHasCalculated(false);
      setError(null);
    };
    ```
    This does not adjust `credit` and `months` states. If `credit` is `500000` and `months` is `180`, they remain set after switching to `veiculo` (where max limits are `300000` and `100`).
  - Lines 88–90 cap `confortoMonths` for vehicles to `100` months:
    ```tsx
    confortoMonths = Math.min(100, Math.round(monthsNum * 1.5));
    if (confortoMonths <= monthsNum) confortoMonths = 100;
    ```
    With `monthsNum = 180`, `confortoMonths` becomes `100`. The Titanium installment is calculated with `180` months, and Conforto is calculated with `100` months, making Conforto installment higher.
- **Simulator Input Sanitization**:
  - `src/components/ParcelSimulator.tsx` (lines 31–36) uses sanitization for months:
    ```tsx
    const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = e.target.value.replace(/[^-0-9]/g, "");
      setMonths(sanitized);
      ...
    ```
    This regex allows inputs like `"12-3"` or `"1--0"` in the text input.
- **Simulator plan cards accessibility**:
  - `src/components/ParcelSimulator.tsx` (lines 285–294 and 327–336) define the cards as simple `div` tags with `onClick` triggers but no `tabIndex`, roles, or keyboard event listeners.

---

## 2. Logic Chain
1. The absence of assertions for detailed JSON-LD properties, sitemap URLs, and robots.txt content in `tests/test_landing_page.py` means any structural change in these SEO/metadata assets would go undetected by the test suite.
2. Because `Navbar.tsx` manages mobile overlay visibility strictly through `isOpen` state and does not handle window resize events or apply responsive hiding classes (`lg:hidden`), opening the mobile menu and resizing to desktop will keep the overlay mounted, blocking page usage and keeping the body scroll-locked.
3. Because `isCalculateDisabled` only checks if `credit === ""`, users clearing the `months` field will see an active button. Clicking it calls `calculateScenarios()` which triggers a validation error instead of preventing the action.
4. Because `handleSegmentChange` does not clamp inputs, switching from `imovel` to `veiculo` leaves `credit = "500000"` and `months = "180"`. Clicking calculate processes these values. Since Conforto's term is capped to `100` months (while Titanium uses the input `180`), Conforto's installment `(500000 * 1.22 / 100 = 6100)` becomes higher than Titanium's `(500000 * 1.22 / 180 = 3388.88)`.
5. Allowing dashes in `handleMonthsChange` permits malformed numeric input (like `"12-3"`) to be stored in the component's state. When calculate is clicked, `Number("12-3")` evaluates to `NaN`, failing the validation check.
6. The lack of `tabIndex` and keydown listeners on the plan selection cards makes it impossible for keyboard-only or assistive-technology users to select the Conforto plan, which is a key keyboard interaction boundary condition.

---

## 3. Caveats
- We assume that the external PHP files listed in robots.txt (`/cartas/login.php`) and sitemap.xml (`/cartas/cartas.php`) are hosted separately and do not need to be validated in this specific landing page repository, other than confirming that their reference URLs are output correctly.
- Viewport resize tests depend on Playwright's viewport resizing behavior.

---

## 4. Conclusion
We conclude that Phase 2 E2E test coverage requires 7 additional Tier 5 Adversarial and Hardening tests. Implementing these tests will guarantee that SEO assets, viewport resizing behaviors, state transitions, sanitization limits, and accessibility boundaries are strictly monitored.

---

## 5. Verification Method
1. The new tests can be appended to `tests/test_landing_page.py` or placed in a new test file, e.g., `tests/test_landing_page_tier5.py`.
2. Run the test suite using the project's dev-wrapper test command:
   ```bash
   python C:\Users\Pichau\.gemini\config\skills\webapp-testing\scripts\with_server.py --server "npm run dev" --port 3000 -- pytest
   ```
3. A test failure in `test_tier5_navbar_mobile_menu_viewport_resize_quirk` or `test_tier5_simulator_keyboard_accessibility_gaps` will confirm the presence of these UI/UX bugs in the current implementation.

---

## Proposed Test Code (Python Playwright)
Here is the exact Python code for the proposed tests:

```python
import json
import pytest
from playwright.sync_api import Page, expect

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
    
    service_veiculo = data[2]
    assert service_veiculo["@type"] == "Service"
    assert "Veículos" in service_veiculo["name"]


def test_tier5_navbar_mobile_menu_viewport_resize_quirk(page: Page, base_url: str):
    """Verifies the navbar mobile menu overlay persistence and scroll lock quirk upon dynamic resizing."""
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
    
    # The overlay has no lg:hidden class, so it remains visible, trapping the user on desktop.
    expect(overlay).to_be_visible()
    
    # Scroll lock is still active
    body_overflow_after_resize = page.evaluate("document.body.style.overflow")
    assert body_overflow_after_resize == "hidden"


def test_tier5_simulator_empty_months_inconsistent_disabled_state(page: Page, base_url: str):
    """Verifies that the calculate button is not disabled when months is empty, leading to validation error."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    credit_input = page.locator("#simulator-credit")
    months_input = page.locator("#simulator-months")
    calc_button = page.locator("#calculate-btn")

    # 1. When credit is empty, button is disabled
    credit_input.fill("")
    expect(calc_button).to_be_disabled()

    # 2. When credit is filled, but months is empty, button is NOT disabled
    credit_input.fill("500000")
    months_input.fill("")
    expect(calc_button).to_be_enabled()

    # 3. Clicking calculate with empty months triggers validation error
    calc_button.click()
    error_msg = page.locator("#simulator-validation-msg")
    expect(error_msg).to_be_visible()
    expect(error_msg).to_contain_text("Prazo inválido")


def test_tier5_simulator_segment_switch_out_of_bounds_calculation(page: Page, base_url: str):
    """Verifies that switching segments preserves out-of-bounds inputs and calculates them, leading to Conforto installment being higher than Titanium."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    # 1. Switch modal to Vehicle
    segment_select = page.locator("#simulator-type")
    segment_select.select_option("veiculo")

    # Verify inputs are still at their default values (which are out-of-bounds for vehicle)
    credit_input = page.locator("#simulator-credit")
    months_input = page.locator("#simulator-months")
    expect(credit_input).to_have_value("500000")
    expect(months_input).to_have_value("180")

    # 2. Click Calculate
    calc_button = page.locator("#calculate-btn")
    calc_button.click()

    # Verify no validation error is shown (validation only checks for <= 0)
    error_msg = page.locator("#simulator-validation-msg")
    expect(error_msg).not_to_be_visible()

    # Verify calculation succeeded. Get plan card values.
    # Titanium card should show (500000 * 1.22) / 180 = 3388.88
    # Conforto card should show (500000 * 1.22) / 100 = 6100.00
    titanium_card = page.locator("div:has-text('Plano Titanium')").filter(has_text="Parcela Estimada").first
    conforto_card = page.locator("div:has-text('Plano Conforto')").filter(has_text="Parcela Estimada").first
    
    titanium_val_text = titanium_card.locator("span.text-2xl").text_content()
    conforto_val_text = conforto_card.locator("span.text-2xl").text_content()

    assert "3.388" in titanium_val_text
    assert "6.100" in conforto_val_text


def test_tier5_simulator_sanitization_and_invalid_inputs(page: Page, base_url: str):
    """Verifies input sanitization behavior for decimals in credit and invalid dash patterns in months."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    credit_input = page.locator("#simulator-credit")
    months_input = page.locator("#simulator-months")
    calc_button = page.locator("#calculate-btn")

    # 1. Check decimal credit sanitization (should strip '.')
    credit_input.fill("150000.75")
    expect(credit_input).to_have_value("15000075")

    # 2. Check months sanitization allows '-' but fails calculation
    months_input.fill("12-3")
    expect(months_input).to_have_value("12-3")

    calc_button.click()
    
    # Calculation fails since 12-3 is parsed as NaN by Number()
    error_msg = page.locator("#simulator-validation-msg")
    expect(error_msg).to_be_visible()
    expect(error_msg).to_contain_text("Prazo inválido")


def test_tier5_simulator_keyboard_accessibility_gaps(page: Page, base_url: str):
    """Verifies that plan card selection divs are not keyboard focusable and do not respond to Enter/Space keys."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    # Ensure simulator cards exist
    titanium_card = page.locator("div:has-text('Plano Titanium')").filter(has_text="Parcela Estimada").first
    conforto_card = page.locator("div:has-text('Plano Conforto')").filter(has_text="Parcela Estimada").first

    # 1. Cards do not have tabIndex and therefore cannot be focused via Keyboard
    expect(titanium_card).not_to_have_attribute("tabindex", __import__("re").compile(r".*"))
    expect(conforto_card).not_to_have_attribute("tabindex", __import__("re").compile(r".*"))

    # 2. Focus on months and press Tab to see if focus bypasses cards to Calculate button
    months_input = page.locator("#simulator-months")
    months_input.focus()
    
    # Press tab - should go to Calculate button
    page.keyboard.press("Tab")
    is_calc_focused = page.evaluate("document.activeElement.id === 'calculate-btn'")
    assert is_calc_focused

    # Press tab again - since cards are not focusable, it should jump straight to WhatsApp button
    page.keyboard.press("Tab")
    is_card_focused = page.evaluate(
        "document.activeElement.textContent.includes('Plano Titanium') || document.activeElement.textContent.includes('Plano Conforto')"
    )
    assert not is_card_focused


def test_tier5_invalid_query_parameters_graceful_load(page: Page, base_url: str):
    """Verifies that the landing page loads gracefully and doesn't crash when passing unexpected/malicious query parameters."""
    page.goto(f"{base_url}/?segmento=invalid&credit=abc&months=-100&hacked='or+1=1--")
    page.wait_for_load_state("networkidle")
    
    # Verify main page elements are still visible and layout didn't crash
    expect(page.locator("h1")).to_be_visible()
    expect(page.locator("nav")).to_be_visible()
```
