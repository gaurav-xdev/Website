import time
from playwright.sync_api import sync_playwright

baseUrl = "http://localhost:5173"

pages_to_test = [
    ("qa_page1_how_it_works.png", f"{baseUrl}/#/how-it-works"),
    ("qa_page2_privacy.png", f"{baseUrl}/#/privacy"),
    ("qa_page3_faq.png", f"{baseUrl}/#/faq"),
    ("qa_page4_get_osmoo.png", f"{baseUrl}/#/download"),
    ("qa_page5_pricing.png", f"{baseUrl}/#/pricing"),
]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    
    console_errors = []
    page.on("console", lambda msg: console_errors.append(f"Console error: {msg.text}") if msg.type == "error" else None)

    for filename, url in pages_to_test:
        print(f"Navigating to {url}...")
        page.goto(url)
        time.sleep(2.0)
        out_path = f"c:\\Users\\gaurav\\Downloads\\OSMOO\\public\\{filename}"
        page.screenshot(path=out_path, full_page=True)
        print(f"Captured {filename}")

    # Also test mobile view for pricing and how-it-works
    page_mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    page_mobile.goto(f"{baseUrl}/#/pricing")
    time.sleep(1.5)
    page_mobile.screenshot(path=r"c:\Users\gaurav\Downloads\OSMOO\public\qa_mobile_pricing.png", full_page=True)
    print("Captured qa_mobile_pricing.png")

    page_mobile.goto(f"{baseUrl}/#/how-it-works")
    time.sleep(1.5)
    page_mobile.screenshot(path=r"c:\Users\gaurav\Downloads\OSMOO\public\qa_mobile_how_it_works.png", full_page=True)
    print("Captured qa_mobile_how_it_works.png")

    browser.close()

print(f"Testing finished. Total console errors: {len(console_errors)}")
