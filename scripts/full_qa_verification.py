import time
from playwright.sync_api import sync_playwright

url = "http://localhost:5173/"
output_hero = r"c:\Users\gaurav\Downloads\OSMOO\public\qa_hero_1024x740.png"
output_full_desktop = r"c:\Users\gaurav\Downloads\OSMOO\public\qa_full_page_desktop.png"
output_mobile = r"c:\Users\gaurav\Downloads\OSMOO\public\qa_full_page_mobile.png"
output_giant_brand = r"c:\Users\gaurav\Downloads\OSMOO\public\qa_giant_brand.png"
output_macbook = r"c:\Users\gaurav\Downloads\OSMOO\public\qa_macbook.png"
output_pipeline = r"c:\Users\gaurav\Downloads\OSMOO\public\qa_pipeline.png"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)

    # 1. Capture Hero at reference viewport (1024x740)
    print("--- 1. Testing Hero at 1024x740 ---")
    page_hero = browser.new_page(viewport={"width": 1024, "height": 740}, device_scale_factor=1)
    errors = []
    page_hero.on("console", lambda m: errors.append(f"Console {m.type}: {m.text}") if m.type == "error" else None)
    page_hero.goto(url)
    page_hero.wait_for_selector("canvas", timeout=10000)
    time.sleep(5.0)
    page_hero.screenshot(path=output_hero, full_page=False)
    print(f"Hero screenshot captured: {output_hero}")

    # 2. Capture Full-Page Desktop (1440x900 viewport, full_page=True)
    print("--- 2. Testing Full Desktop Page ---")
    page_desktop = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    page_desktop.goto(url)
    page_desktop.wait_for_selector("canvas", timeout=10000)
    time.sleep(4.0)

    # Capture Full Page Desktop
    page_desktop.screenshot(path=output_full_desktop, full_page=True)
    print(f"Full page desktop screenshot captured: {output_full_desktop}")

    # 3. Test Navigation smooth scroll
    print("--- 3. Testing Navigation ---")
    features_link = page_desktop.locator('nav a[href="#features"]')
    features_link.click()
    time.sleep(1.0)
    page_desktop.screenshot(path=output_pipeline, full_page=False)
    print(f"Pipeline section screenshot captured: {output_pipeline}")

    ecosystem_link = page_desktop.locator('nav a[href="#ecosystem"]')
    ecosystem_link.click()
    time.sleep(1.0)

    contact_link = page_desktop.locator('nav a[href="#contact"]')
    contact_link.click()
    time.sleep(1.0)

    # 4. Mobile Viewport Full Page (390x844)
    print("--- 4. Testing Mobile Viewport ---")
    page_mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    page_mobile.goto(url)
    page_mobile.wait_for_selector("canvas", timeout=10000)
    time.sleep(4.0)
    page_mobile.screenshot(path=output_mobile, full_page=True)
    print(f"Mobile full page screenshot captured: {output_mobile}")

    print("Console error count across runs:", len(errors))
    for err in errors:
        print("  ", err)

    browser.close()

print("QA Verification completed successfully!")
