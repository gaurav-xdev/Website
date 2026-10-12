import time
from playwright.sync_api import sync_playwright

url = "http://localhost:5173"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)

    errors = []
    page.on("console", lambda m: errors.append(f"Console error: {m.text}") if m.type == "error" else None)

    # 1. Hero at scroll 0
    print("Testing Hero at scroll 0...")
    page.goto(url)
    page.wait_for_selector("canvas", timeout=10000)
    time.sleep(3.0)
    page.screenshot(path=r"c:\Users\gaurav\Downloads\OSMOO\public\qa_scroll_0_hero.png", full_page=False)

    # Calculate total scroll height
    total_scroll = page.evaluate("document.documentElement.scrollHeight - window.innerHeight")
    print(f"Total scrollable distance: {total_scroll}px")

    # 2. Scroll to Giant OSMOO (around 20% scroll)
    print("Scrolling to Giant OSMOO (20%)...")
    page.evaluate(f"window.scrollTo({{ top: {total_scroll * 0.18}, behavior: 'smooth' }})")
    time.sleep(2.5)
    page.screenshot(path=r"c:\Users\gaurav\Downloads\OSMOO\public\qa_scroll_20_giantosmoo.png", full_page=False)

    # 3. Scroll to MacBook (around 40% scroll)
    print("Scrolling to MacBook Showcase (40%)...")
    page.evaluate(f"window.scrollTo({{ top: {total_scroll * 0.38}, behavior: 'smooth' }})")
    time.sleep(2.5)
    page.screenshot(path=r"c:\Users\gaurav\Downloads\OSMOO\public\qa_scroll_40_macbook.png", full_page=False)

    # 4. Scroll to Pipeline (around 60% scroll)
    print("Scrolling to Pipeline Section (60%)...")
    page.evaluate(f"window.scrollTo({{ top: {total_scroll * 0.60}, behavior: 'smooth' }})")
    time.sleep(2.5)
    page.screenshot(path=r"c:\Users\gaurav\Downloads\OSMOO\public\qa_scroll_60_pipeline.png", full_page=False)

    # 5. Scroll to Ecosystem / Contact (around 85% scroll)
    print("Scrolling to Ecosystem / Contact (85%)...")
    page.evaluate(f"window.scrollTo({{ top: {total_scroll * 0.85}, behavior: 'smooth' }})")
    time.sleep(2.5)
    page.screenshot(path=r"c:\Users\gaurav\Downloads\OSMOO\public\qa_scroll_85_ecosystem.png", full_page=False)

    # 6. Scroll back up to Hero (smooth reverse travel)
    print("Scrolling in reverse back to top (0%)...")
    page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
    time.sleep(2.5)
    page.screenshot(path=r"c:\Users\gaurav\Downloads\OSMOO\public\qa_scroll_reverse_hero.png", full_page=False)

    # 7. Check Pricing Page companion
    print("Testing Pricing Page companion...")
    page.goto(f"{url}/#/pricing")
    time.sleep(2.5)
    page.screenshot(path=r"c:\Users\gaurav\Downloads\OSMOO\public\qa_scroll_pricing.png", full_page=False)

    browser.close()

print(f"Scroll-linked test completed! Console errors: {len(errors)}")
