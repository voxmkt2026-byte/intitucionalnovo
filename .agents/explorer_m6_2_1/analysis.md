# White-Box Audit & Adversarial Test Formulation Report

## 1. Executive Summary

This report presents a detailed white-box audit of the Titanium Consultoria landing page project files, identifying critical logical gaps, input validation omissions, state leakage, accessibility shortcomings, and viewport rendering quirks. 

While the existing suite of 60 E2E tests provides high-level feature coverage, it fails to evaluate adversarial scenarios. The current codebase does not protect against out-of-bounds user inputs typed directly into the simulator text boxes, logical plan inversions, or state leakage during segment switching. 

We propose **11 precise, concrete Tier 5 adversarial test cases** written in Python using the Playwright sync API. These tests are designed to execute against the simulated server environment, exposing these vulnerabilities and establishing a robust regression barrier for Phase 2 hardening.

---

## 2. Audited Implementation Files Summary

We conducted a complete white-box review of the following source files located under `src/`:

1. **`src/app/layout.tsx`**: Sets up global HTML layout, font weights, viewport scaling, page title, Open Graph/Twitter meta headers, and inserts structured JSON-LD schemas (`Organization`, `Service`) representing the financial letters of credit.
2. **`src/app/page.tsx`**: Standard entry point. Imports and aggregates the `Navbar`, `Hero`, `ValueProps`, `Segments`, `ParcelSimulator`, `About`, `Footer`, and `WhatsAppButton` elements inside a semantic structure.
3. **`src/app/robots.ts`**: Configures search engine crawl rules, allowing root access but explicitly disallowing `/cartas/login.php` (admin entry point) and `/api/`, pointing to the sitemap location.
4. **`src/app/sitemap.ts`**: Provides dynamic search indexing URLs for the home route, plus segmented PHP endpoints (`/cartas/cartas.php?segmento=imovel` and `/cartas/cartas.php?segmento=veiculo`).
5. **`src/components/ParcelSimulator.tsx`**: Houses the core mathematical engine. Contains React state variables for segment, credit, months duration, selected plan, and active calculations. Integrates dual sliders and text inputs with custom sanitization.
6. **`src/components/Navbar.tsx`**: Standard floating navigation bar styled as a glass pill overlay. Locks body scroll lock to `hidden` when mobile navigation menu is expanded.
7. **`src/components/WhatsAppButton.tsx`**: Implements a sticky floating action bubble (FAB) directing the user to a consultant on WhatsApp. Includes hover tooltips and pulse rings.
8. **`src/components/Hero.tsx`**: Controls copywriting and visuals of the landing fold, showcasing the key value propositions.
9. **`src/components/ValueProps.tsx`**: Features a bento grid highlighting "Diligência Jurídica Prévia", "Celeridade na Cessão", "Inteligência Tarifária", and "Assessoria Concierge".
10. **`src/components/Segments.tsx`**: Houses dual cards redirection to the PHP-based letters of credit inventory.
11. **`src/components/About.tsx`**: Highlights company compliance, transparency, and background.
12. **`src/components/Footer.tsx`**: Discloses legal disclaimers, company registration (CNPJ), and structural information.

---

## 3. Discovered Code Gaps & Logical Vulnerabilities

During our investigation of `src/components/ParcelSimulator.tsx` and `src/components/Navbar.tsx`, we identified several critical gaps:

### G1: Manual Credit Input Limit Bypass
- **Location**: `src/components/ParcelSimulator.tsx` (Line 23-28, 48-63)
- **Vulnerability**: While the range sliders clamp credit values visually, the text input (`simulator-credit`) only filters out non-digits:
  ```typescript
  const handleCreditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/\D/g, "");
    setCredit(sanitized);
    ...
  }
  ```
  In `calculateScenarios`, the validation only checks if `creditNum <= 0`. It does NOT verify if the typed credit exceeds `maxCredit` or falls below `minCredit`.
- **Adversarial Vector**: A user can manually type `1` or `99999999` and successfully execute a calculation. For `veiculo` (max 300,000), simulating 50 million runs without errors, showing unrealistic installments that propagate to the WhatsApp CTA.

### G2: Manual Months Duration Limit Bypass
- **Location**: `src/components/ParcelSimulator.tsx` (Line 31-36, 48-63)
- **Vulnerability**: The months text input (`simulator-months`) permits users to type any digits (and a negative sign to trigger standard bounds check):
  ```typescript
  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^-0-9]/g, "");
    setMonths(sanitized);
    ...
  }
  ```
  The logic checks `monthsNum <= 0` but fails to enforce `maxMonths` (100 for vehicles, 240 for properties) when values are entered manually.
- **Adversarial Vector**: Entering `999` months executes the simulation, producing invalid monthly installment calculations.

### G3: Conforto Plan Logical Inversion Under High Term Input
- **Location**: `src/components/ParcelSimulator.tsx` (Line 78-79, 89-90)
- **Vulnerability**: The Conforto plan duration is calculated by multiplying Titanium months by 1.5, capped at the max limit (240 for real estate, 100 for vehicles):
  ```typescript
  confortoMonths = Math.min(240, Math.round(monthsNum * 1.5));
  if (confortoMonths <= monthsNum) confortoMonths = 240;
  ```
  If the user types a term greater than 240 (e.g. 300 months) for real estate:
  - `confortoMonths` is set to `240` (since `Math.min(240, 450) = 240`).
  - The check `confortoMonths <= monthsNum` (i.e. `240 <= 300`) evaluates to `true`.
  - Thus, Conforto months stays `240`.
  - The Titanium plan has a term of `300` months, while the Conforto plan has a term of `240` months.
  - Since the rate for both is identical (`0.18`), the Conforto monthly installment is **higher** than the Titanium installment, and its term is **shorter**. This completely inverts the business logic where Conforto must offer "lower monthly installments via longer term".

### G4: Segment Switching Cross-Contamination (State Leakage)
- **Location**: `src/components/ParcelSimulator.tsx` (Line 38-42)
- **Vulnerability**: 
  ```typescript
  const handleSegmentChange = (val: "imovel" | "veiculo") => {
    setSegment(val);
    setHasCalculated(false);
    setError(null);
  };
  ```
  Changing the segment from `imovel` to `veiculo` does not reset or clamp the `credit` and `months` states. 
- **Adversarial Vector**: A user selects `imovel`, sets credit to `500,000` and months to `180`. When they switch to `veiculo`, the text box retains `500,000` credit (exceeds vehicle max of `300,000`) and `180` months (exceeds vehicle max of `100`). Clicking "Calcular Planos" executes a vehicle calculation with these invalid values. The range slider is bound visually but is decoupled from the text state.

### G5: Accessible Focus (Keyboard Navigation) Gaps on Plan Cards
- **Location**: `src/components/ParcelSimulator.tsx` (Line 285-364)
- **Vulnerability**: The selection wrappers for Plano Titanium and Plano Conforto are implemented as standard `div` tags with `onClick` event listeners. They do not have `tabIndex={0}`, keyboard handlers (`onKeyDown`), or ARIA roles.
- **Adversarial Vector**: Users navigating exclusively via keyboard (`Tab` keys) cannot focus on or toggle between the plans, which is a major WCAG accessibility violation.

### G6: Body Scroll Lock Resizing Vulnerability
- **Location**: `src/components/Navbar.tsx` (Line 25-34, 154-214)
- **Vulnerability**: Expanding the mobile menu sets `document.body.style.overflow = "hidden"`. If a user rotates their mobile device to landscape (triggering desktop breakpoint) or changes viewport width while the menu is open, the mobile menu overlay disappears via CSS media queries, but the React state `isOpen` remains `true` and the body remains scroll-locked to `hidden` indefinitely.

---

## 4. Tier 5 Adversarial Test Cases (Python + Playwright)

These test cases use the Playwright sync API and fit the architecture established in `tests/test_landing_page.py`.

```python
import pytest
import re
from playwright.sync_api import Page, expect

# ==============================================================================
# TIER 5: ADVERSARIAL & COMPLIANCE HARDENING TESTS
# ==============================================================================

def test_adversarial_credit_below_minimum_manual(page: Page, base_url: str):
    """Verifies that manually typing credit below minimum (e.g. 50000 for imovel) triggers a validation error."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # 1. Set segment to imovel (min is 100000)
    page.locator("#simulator-type").select_option("imovel")
    
    # 2. Fill credit manually with 50000
    page.locator("#simulator-credit").fill("50000")
    
    # 3. Try to calculate
    page.locator("#calculate-btn").click()
    
    # 4. Expect validation error to show and block calculation
    error_msg = page.locator("#simulator-validation-msg")
    expect(error_msg).to_be_visible()
    expect(error_msg).to_contain_text(re.compile("mínimo|menor|inválido", re.IGNORECASE))


def test_adversarial_credit_above_maximum_manual(page: Page, base_url: str):
    """Verifies that manually typing credit above maximum (e.g. 3000000 for imovel) triggers a validation error."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # 1. Set segment to imovel (max is 2000000)
    page.locator("#simulator-type").select_option("imovel")
    
    # 2. Fill credit manually with 3000000
    page.locator("#simulator-credit").fill("3000000")
    
    # 3. Try to calculate
    page.locator("#calculate-btn").click()
    
    # 4. Expect validation error to show and block calculation
    error_msg = page.locator("#simulator-validation-msg")
    expect(error_msg).to_be_visible()
    expect(error_msg).to_contain_text(re.compile("máximo|limite|inválido", re.IGNORECASE))


def test_adversarial_months_below_minimum_manual(page: Page, base_url: str):
    """Verifies that manually typing months below minimum (e.g. 30 for imovel) triggers a validation error."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # 1. Set segment to imovel (min is 60 months)
    page.locator("#simulator-type").select_option("imovel")
    
    # 2. Fill months manually with 30
    page.locator("#simulator-months").fill("30")
    
    # 3. Try to calculate
    page.locator("#calculate-btn").click()
    
    # 4. Expect validation error
    error_msg = page.locator("#simulator-validation-msg")
    expect(error_msg).to_be_visible()
    expect(error_msg).to_contain_text(re.compile("mínimo|prazo|inválido", re.IGNORECASE))


def test_adversarial_months_above_maximum_manual(page: Page, base_url: str):
    """Verifies that manually typing months above maximum (e.g. 500 for imovel) triggers a validation error."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # 1. Set segment to imovel (max is 240 months)
    page.locator("#simulator-type").select_option("imovel")
    
    # 2. Fill months manually with 500
    page.locator("#simulator-months").fill("500")
    
    # 3. Try to calculate
    page.locator("#calculate-btn").click()
    
    # 4. Expect validation error
    error_msg = page.locator("#simulator-validation-msg")
    expect(error_msg).to_be_visible()
    expect(error_msg).to_contain_text(re.compile("máximo|limite|inválido", re.IGNORECASE))


def test_adversarial_months_negative_error_bounds(page: Page, base_url: str):
    """Verifies that entering negative months prevents calculation and triggers a standard validation warning."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # 1. Fill negative months (-10)
    page.locator("#simulator-months").fill("-10")
    
    # 2. Click calculate
    page.locator("#calculate-btn").click()
    
    # 3. Expect correct validation error
    error_msg = page.locator("#simulator-validation-msg")
    expect(error_msg).to_be_visible()
    expect(error_msg).to_contain_text("Prazo inválido. O número de meses deve ser maior que zero.")


def test_adversarial_logical_inversion_prevention(page: Page, base_url: str):
    """Verifies that entering months greater than the maximum (e.g. 300 for imovel) does not cause logical inversion between plans."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    page.locator("#simulator-type").select_option("imovel")
    page.locator("#simulator-credit").fill("500000")
    page.locator("#simulator-months").fill("300")
    page.locator("#calculate-btn").click()
    
    # Locate term indicators in Plano Titanium and Plano Conforto cards
    titanium_months_text = page.locator("div:has-text('Plano Titanium') + div + div").locator("span.font-bold").first.inner_text()
    conforto_months_text = page.locator("div:has-text('Plano Conforto') + div + div").locator("span.font-bold").first.inner_text()
    
    titanium_months = int("".join(filter(str.isdigit, titanium_months_text)))
    conforto_months = int("".join(filter(str.isdigit, conforto_months_text)))
    
    # Plano Conforto MUST represent a longer or equal term compared to Plano Titanium
    assert conforto_months >= titanium_months, f"Logical inversion: Conforto term ({conforto_months}) is shorter than Titanium term ({titanium_months})"


def test_adversarial_segment_switch_credit_leakage(page: Page, base_url: str):
    """Verifies that changing segment from imovel to veiculo handles high credit amounts safely (clamping or validation error)."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # 1. Set segment to imovel and credit to 500,000 (exceeds veiculo max of 300,000)
    page.locator("#simulator-type").select_option("imovel")
    page.locator("#simulator-credit").fill("500000")
    
    # 2. Switch segment to veiculo
    page.locator("#simulator-type").select_option("veiculo")
    
    # 3. Trigger calculation
    page.locator("#calculate-btn").click()
    
    # 4. Verify that credit is clamped to <= 300,000 or it triggers a validation error. 
    # It must NOT calculate installments using 500,000 for a vehicle.
    credit_value = page.locator("#simulator-credit").input_value()
    assert int(credit_value) <= 300000, f"Cross-segment state leakage: credit {credit_value} is above maxCredit for veiculo"


def test_adversarial_segment_switch_months_leakage(page: Page, base_url: str):
    """Verifies that changing segment from imovel to veiculo handles high duration periods safely (clamping or validation error)."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # 1. Set segment to imovel and months to 180 (exceeds veiculo max of 100)
    page.locator("#simulator-type").select_option("imovel")
    page.locator("#simulator-months").fill("180")
    
    # 2. Switch segment to veiculo
    page.locator("#simulator-type").select_option("veiculo")
    
    # 3. Trigger calculation
    page.locator("#calculate-btn").click()
    
    # 4. Verify that months value is clamped to <= 100 or it triggers a validation error.
    months_value = page.locator("#simulator-months").input_value()
    assert int(months_value) <= 100, f"Cross-segment state leakage: months {months_value} is above maxMonths for veiculo"


def test_adversarial_plan_selection_accessibility(page: Page, base_url: str):
    """Verifies that selection cards for Titanium and Conforto plans are focusable and navigable via keyboard."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # 1. Trigger calculation so results cards show up
    page.locator("#calculate-btn").click()
    
    # 2. Inspect plan selection wrappers (cards)
    titanium_card = page.locator("div:has-text('Plano Titanium')").first
    conforto_card = page.locator("div:has-text('Plano Conforto')").first
    
    # 3. Expect keyboard focus attributes (tabindex)
    expect(titanium_card).to_have_attribute("tabindex", "0")
    expect(conforto_card).to_have_attribute("tabindex", "0")
    
    # 4. Expect ARIA roles indicating buttons or radio components
    expect(titanium_card).to_have_attribute("role", re.compile("button|radio"))
    expect(conforto_card).to_have_attribute("role", re.compile("button|radio"))


def test_adversarial_mobile_menu_scroll_lock_resize(page: Page, base_url: str):
    """Verifies that rotating or resizing the screen to desktop while mobile menu is open automatically clears body overflow scroll lock."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # 1. Open mobile menu
    page.locator("button[aria-label='Abrir menu']").click()
    
    # 2. Verify scroll is locked
    body = page.locator("body")
    expect(body).to_have_css("overflow", "hidden")
    
    # 3. Resize dynamically to desktop width
    page.set_viewport_size({"width": 1280, "height": 800})
    page.wait_for_timeout(300) # Wait for resize listeners and layout changes
    
    # 4. Verify body scroll lock is cleared (must be empty string or auto/visible)
    overflow_value = body.evaluate("el => el.style.overflow")
    assert overflow_value != "hidden", "Body scroll lock was not released after viewport resized to desktop"


def test_adversarial_dynamic_viewport_resizing_simulator_visibility(page: Page, base_url: str):
    """Verifies that resizing the viewport dynamically to extremely narrow widths (e.g. 320px) doesn't break simulator layout or cause horizontal overflow."""
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # Verify simulator is visible
    simulator = page.locator("#simulator")
    expect(simulator).to_be_visible()
    
    # Dynamically scale down to 320px (e.g. iPhone SE/unusual mobile fold)
    page.set_viewport_size({"width": 320, "height": 568})
    page.wait_for_timeout(300)
    
    # Verify no horizontal scrollbars on document
    overflow_detected = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    assert not overflow_detected, "Simulator section caused horizontal scroll overflow at 320px viewport width"
```
