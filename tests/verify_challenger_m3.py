#!/usr/bin/env python3
import sys
import re
import urllib.parse
from playwright.sync_api import sync_playwright

def run_verification():
    print("=== Starting Verification Script ===")
    
    console_logs = []
    
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        # Create context
        context = browser.new_context()
        page = context.new_page()
        
        # Listen for console logs (warnings and errors)
        def handle_console(msg):
            log_str = f"[{msg.type.upper()}] {msg.text}"
            console_logs.append(log_str)
            print(f"Console: {log_str}")
            
        page.on("console", handle_console)
        
        # Open page
        print("Navigating to http://localhost:3000 ...")
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")
        
        # Viewport scaling verification
        viewports = [320, 375, 768, 1440]
        print("\n--- Viewport Scaling & Overflow Verification ---")
        for width in viewports:
            page.set_viewport_size({"width": width, "height": 800})
            page.wait_for_timeout(500)  # Wait for layout to settle
            
            # Programmatically verify horizontal scroll/overflow
            scroll_width = page.evaluate("document.documentElement.scrollWidth")
            window_width = page.evaluate("window.innerWidth")
            body_scroll_width = page.evaluate("document.body.scrollWidth")
            
            has_overflow = scroll_width > window_width or body_scroll_width > window_width
            print(f"Viewport {width}px: scrollWidth={scroll_width}, innerWidth={window_width}, body.scrollWidth={body_scroll_width}")
            if has_overflow:
                print(f"  [WARNING/FAIL] Horizontal overflow detected at {width}px!")
            else:
                print(f"  [PASS] No horizontal overflow detected at {width}px.")
                
            # Log layout details
            text_wrapping = page.evaluate("""() => {
                const els = Array.from(document.querySelectorAll('h1, h2, h3, p'));
                return els.map(el => {
                    const style = window.getComputedStyle(el);
                    return {
                        tag: el.tagName,
                        text: el.innerText.substring(0, 30) + '...',
                        wordBreak: style.wordBreak,
                        overflowWrap: style.overflowWrap
                    };
                }).slice(0, 5); // top 5 text elements
            }""")
            print(f"  Sample text elements styles: {text_wrapping}")
            
        # Calculation verification
        print("\n--- Math Model Calculation Verification ---")
        
        test_cases = [
            {
                "segment": "imovel",
                "segment_name": "Imóveis",
                "segment_text": "Imobiliário",
                "credit": 500000,
                "months": 180,
                "titanium_expected": 3194.44,
                "conforto_expected": 2458.33,
                "conforto_months": 240
            },
            {
                "segment": "imovel",
                "segment_name": "Imóveis",
                "segment_text": "Imobiliário",
                "credit": 1000000,
                "months": 120,
                "titanium_expected": 9333.33,
                "conforto_expected": 6388.89,
                "conforto_months": 180
            },
            {
                "segment": "veiculo",
                "segment_name": "Veículos",
                "segment_text": "Veicular",
                "credit": 100000,
                "months": 60,
                "titanium_expected": 1916.67,
                "conforto_expected": 1355.56,
                "conforto_months": 90
            },
            {
                "segment": "veiculo",
                "segment_name": "Veículos",
                "segment_text": "Veicular",
                "credit": 200000,
                "months": 84,
                "titanium_expected": 2809.52,
                "conforto_expected": 2440.00,
                "conforto_months": 100
            }
        ]
        
        # Helper to normalize spacing and verify BRL currency string
        def normalize_spaces(text):
            return re.sub(r'\s+', ' ', text).strip()
            
        for case in test_cases:
            print(f"\nRunning test case: {case['segment_name']} | Credit: {case['credit']} | Months: {case['months']}")
            
            # Select segment
            page.select_option("#simulator-type", value=case["segment"])
            page.wait_for_timeout(100)
            
            # Fill Credit
            page.fill("#simulator-credit", "")
            page.type("#simulator-credit", str(case["credit"]))
            
            # Fill Months
            page.fill("#simulator-months", "")
            page.type("#simulator-months", str(case["months"]))
            
            # Click Calculate
            page.click("#calculate-btn")
            page.wait_for_timeout(200)
            
            # 1. Check Titanium plan card values
            page.locator("text=Plano Titanium").first.click()
            page.wait_for_timeout(100)
            
            titanium_displayed_text = page.locator("#installment-value").text_content()
            
            # Evaluate expected format using page.evaluate to get exactly browser's BRL format
            expected_titanium_formatted = page.evaluate(
                f"({case['titanium_expected']}).toLocaleString('pt-BR', {{ style: 'currency', currency: 'BRL' }})"
            )
            
            print(f"  Titanium installment displayed: {repr(titanium_displayed_text)}")
            print(f"  Titanium installment expected:  {repr(expected_titanium_formatted)}")
            
            assert normalize_spaces(titanium_displayed_text) == normalize_spaces(expected_titanium_formatted), \
                f"Titanium mismatch! Got {titanium_displayed_text}, expected {expected_titanium_formatted}"
                
            # Verify WhatsApp CTA Link for Titanium
            href_titanium = page.locator("#simulator-whatsapp-cta").get_attribute("href")
            parsed_titanium = urllib.parse.urlparse(href_titanium)
            query_titanium = urllib.parse.parse_qs(parsed_titanium.query)
            msg_titanium = query_titanium.get("text", [""])[0]
            
            formatted_credit_brl = page.evaluate(
                f"({case['credit']}).toLocaleString('pt-BR', {{ style: 'currency', currency: 'BRL' }})"
            )
            
            expected_msg_titanium = f"Olá, simulei uma carta de {formatted_credit_brl} com parcelas de {expected_titanium_formatted} no segmento {case['segment_text']} (Titanium). Tenho interesse."
            print(f"  Titanium WhatsApp CTA pre-filled message: {repr(msg_titanium)}")
            
            assert normalize_spaces(msg_titanium) == normalize_spaces(expected_msg_titanium), \
                f"Titanium WhatsApp message mismatch!\nGot: {msg_titanium}\nExpected: {expected_msg_titanium}"
            
            # 2. Check Conforto plan card values
            page.locator("text=Plano Conforto").first.click()
            page.wait_for_timeout(100)
            
            conforto_displayed_text = page.locator("#installment-value").text_content()
            expected_conforto_formatted = page.evaluate(
                f"({case['conforto_expected']}).toLocaleString('pt-BR', {{ style: 'currency', currency: 'BRL' }})"
            )
            
            print(f"  Conforto installment displayed: {repr(conforto_displayed_text)}")
            print(f"  Conforto installment expected:  {repr(expected_conforto_formatted)}")
            
            assert normalize_spaces(conforto_displayed_text) == normalize_spaces(expected_conforto_formatted), \
                f"Conforto mismatch! Got {conforto_displayed_text}, expected {expected_conforto_formatted}"
                
            # Verify WhatsApp CTA Link for Conforto
            href_conforto = page.locator("#simulator-whatsapp-cta").get_attribute("href")
            parsed_conforto = urllib.parse.urlparse(href_conforto)
            query_conforto = urllib.parse.parse_qs(parsed_conforto.query)
            msg_conforto = query_conforto.get("text", [""])[0]
            
            expected_msg_conforto = f"Olá, simulei uma carta de {formatted_credit_brl} com parcelas de {expected_conforto_formatted} no segmento {case['segment_text']} (Conforto). Tenho interesse."
            print(f"  Conforto WhatsApp CTA pre-filled message: {repr(msg_conforto)}")
            
            assert normalize_spaces(msg_conforto) == normalize_spaces(expected_msg_conforto), \
                f"Conforto WhatsApp message mismatch!\nGot: {msg_conforto}\nExpected: {expected_msg_conforto}"
                
            print(f"  [PASS] Test case passed successfully.")

        # Input validation verification
        print("\n--- Input Validation Verification ---")
        
        # Clear credit, type non-numeric characters "abc"
        page.fill("#simulator-credit", "")
        page.type("#simulator-credit", "abc")
        credit_val = page.locator("#simulator-credit").input_value()
        print(f"Credit input value after typing 'abc': {repr(credit_val)}")
        assert credit_val == "", f"Expected credit input to be empty after typing 'abc', but got {repr(credit_val)}"
        print("  [PASS] Non-numeric credit input sanitization verified.")
        
        # Negative months validation
        # First reset credit to a valid number
        page.fill("#simulator-credit", "")
        page.type("#simulator-credit", "500000")
        
        # Type negative months "-10"
        page.fill("#simulator-months", "")
        page.type("#simulator-months", "-10")
        
        # Click calculate
        page.click("#calculate-btn")
        page.wait_for_timeout(200)
        
        # Verify validation warning message is visible and has correct warning
        assert page.locator("#simulator-validation-msg").is_visible(), "Validation warning message not visible for negative months!"
        validation_text = page.locator("#simulator-validation-msg").text_content()
        print(f"Validation message displayed for -10 months: {repr(validation_text)}")
        assert "meses deve ser maior que zero" in validation_text or "Prazo inválido" in validation_text, \
            f"Validation message mismatch! Got: {repr(validation_text)}"
        print("  [PASS] Negative months validation warning verified.")

        # Close browser
        browser.close()
        
    print("\n=== All Verifications Passed Successfully! ===")
    return console_logs

if __name__ == "__main__":
    try:
        run_verification()
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR/FAIL] Verification failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
