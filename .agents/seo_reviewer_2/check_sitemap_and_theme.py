import urllib.request
import re
import sys

def main():
    print("Checking sitemap.xml...")
    try:
        req = urllib.request.Request("http://localhost:3000/sitemap.xml")
        with urllib.request.urlopen(req) as response:
            status = response.status
            headers = response.headers
            content = response.read().decode('utf-8')
            
            print(f"Sitemap HTTP Status: {status}")
            content_type = headers.get("Content-Type", "")
            print(f"Sitemap Content-Type: {content_type}")
            
            # 1. Check status is 200
            assert status == 200, f"Expected status 200, got {status}"
            
            # 2. Check Content-Type starts with application/xml or text/xml
            ct_match = content_type.startswith("application/xml") or content_type.startswith("text/xml")
            assert ct_match, f"Expected Content-Type to start with application/xml or text/xml, got {content_type}"
            print("Content-Type check: PASS")
            
            # 3. Check for lastmod dates
            print("Sitemap Content:")
            print(content)
            
            # Find all <lastmod> contents
            lastmods = re.findall(r'<lastmod>([^<]+)</lastmod>', content)
            print(f"Found lastmod elements: {lastmods}")
            
            # Check that they all match static date 2026-06-11
            # Note: Next.js might format a Date object as 2026-06-11T00:00:00.000Z or similar.
            # We want to verify that "2026-06-11" is the date, and no dynamic current date is used.
            for lastmod in lastmods:
                assert "2026-06-11" in lastmod, f"lastmod contains non-matching date: {lastmod}"
            print("Sitemap lastmod dates check: PASS")
            
    except Exception as e:
        print(f"Sitemap verification FAILED: {e}")
        sys.exit(1)
        
    print("\nChecking homepage theme-color...")
    try:
        req = urllib.request.Request("http://localhost:3000/")
        with urllib.request.urlopen(req) as response:
            status = response.status
            content = response.read().decode('utf-8')
            
            print(f"Homepage HTTP Status: {status}")
            assert status == 200, f"Expected status 200, got {status}"
            
            # Search for theme-color meta tag
            theme_color_meta = re.search(r'<meta[^>]*name=["\']theme-color["\'][^>]*content=["\']#1b4332["\'][^>]*>', content)
            if not theme_color_meta:
                theme_color_meta = re.search(r'<meta[^>]*content=["\']#1b4332["\'][^>]*name=["\']theme-color["\'][^>]*>', content)
                
            if theme_color_meta:
                print(f"Found theme-color tag: {theme_color_meta.group(0)}")
            else:
                # Print all meta tags for debugging
                meta_tags = re.findall(r'<meta[^>]*>', content)
                print(f"Available meta tags: {meta_tags}")
                assert False, "Could not find meta tag for theme-color with content '#1b4332'"
                
            print("theme-color check: PASS")
            
    except Exception as e:
        print(f"Homepage verification FAILED: {e}")
        sys.exit(1)

    print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
