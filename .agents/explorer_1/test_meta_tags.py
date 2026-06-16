import urllib.request
import sys
from html.parser import HTMLParser

class MetaTagParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta_tags = []
        self.html_attribs = {}
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "meta":
            self.meta_tags.append(attrs_dict)
        elif tag == "html":
            self.html_attribs = attrs_dict

try:
    url = "http://localhost:3000/"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        body = response.read().decode("utf-8")
        
        parser = MetaTagParser()
        parser.feed(body)
        
        print("=== HOMEPAGE METADATA INSPECTION ===")
        print(f"HTML lang attribute: {parser.html_attribs.get('lang')}")
        
        print("\nAll Meta Tags:")
        theme_color_found = False
        viewport_found = False
        for meta in parser.meta_tags:
            name = meta.get("name")
            property_attr = meta.get("property")
            content = meta.get("content")
            
            if name:
                print(f"  name='{name}' content='{content}'")
            elif property_attr:
                print(f"  property='{property_attr}' content='{content}'")
            else:
                print(f"  other: {meta}")
                
            if name == "theme-color":
                theme_color_found = True
                print(f"    --> Found theme-color: content='{content}'")
                if content == "#1b4332":
                    print("    --> SUCCESS: theme-color matches #1b4332.")
                else:
                    print("    --> ERROR: theme-color DOES NOT match #1b4332.")
            
            if name == "viewport":
                viewport_found = True
                print(f"    --> Found viewport: content='{content}'")
                
        if not theme_color_found:
            print("ERROR: theme-color meta tag was NOT found in HTML source.")
        if not viewport_found:
            print("ERROR: viewport meta tag was NOT found in HTML source.")

except Exception as e:
    print(f"Failed to fetch homepage: {e}")
    sys.exit(1)
