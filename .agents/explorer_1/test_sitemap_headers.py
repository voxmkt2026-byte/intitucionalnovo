import urllib.request
import sys

try:
    url = "http://localhost:3000/sitemap.xml"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        content_type = response.headers.get("Content-Type")
        body = response.read().decode("utf-8")
        
        print("=== SITEMAP RESPONSE ===")
        print(f"Status Code: {response.status}")
        print(f"Content-Type: {content_type}")
        print("--- Body ---")
        print(body)
        print("=========================")
        
        # Verify Content-Type
        if content_type and ("application/xml" in content_type or "text/xml" in content_type):
            print("Content-Type is CORRECT.")
        else:
            print("ERROR: Content-Type is INCORRECT.")
            
        # Verify Static Dates
        if "2026-06-11" in body:
            print("Static date '2026-06-11' is PRESENT.")
        else:
            print("ERROR: Static date '2026-06-11' is MISSING.")
            
        # Check for dynamic values (such as today's date dynamically generated)
        # Let's count how many times '<lastmod>' tag is present
        lastmods = [line for line in body.splitlines() if "<lastmod>" in line]
        print(f"Found {len(lastmods)} <lastmod> elements:")
        for lm in lastmods:
            print(f"  {lm.strip()}")
            if "2026-06-11" not in lm:
                print(f"  WARNING: Non-static date in lastmod: {lm}")

except Exception as e:
    print(f"Failed to fetch sitemap: {e}")
    sys.exit(1)
