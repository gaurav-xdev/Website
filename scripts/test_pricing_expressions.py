import os
import time
from playwright.sync_api import sync_playwright

def test_pricing_expressions():
    os.makedirs('public', exist_ok=True)
    console_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        # 1440x900 desktop viewport
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        print("Navigating to http://localhost:5173/#/pricing...")
        page.goto("http://localhost:5173/#/pricing", wait_until="domcontentloaded")
        time.sleep(2.5)

        # 1. Neutral expression
        print("Capturing 1. Neutral expression...")
        page.screenshot(path="public/qa_expr_neutral.png")

        # 2. Free plan hover (sad puppy droop)
        print("Hovering Free plan card...")
        free_card = page.locator('text=Download Free').locator('xpath=ancestor::div[contains(@class, "rounded-3xl")][1]')
        free_card.hover(force=True)
        time.sleep(1.2)
        page.screenshot(path="public/qa_expr_free.png")

        # 3. Pro plan hover (smiling squint)
        print("Hovering Pro plan card...")
        pro_card = page.locator('text=Get OSMOO Pro').locator('xpath=ancestor::div[contains(@class, "rounded-3xl")][1]')
        pro_card.hover(force=True)
        time.sleep(1.2)
        page.screenshot(path="public/qa_expr_pro.png")

        # 4. Max plan hover (excited wide eyes + bounce)
        print("Hovering Max plan card...")
        max_card = page.locator('text=Request Max Access').locator('xpath=ancestor::div[contains(@class, "rounded-3xl")][1]')
        max_card.hover(force=True)
        time.sleep(1.2)
        page.screenshot(path="public/qa_expr_max.png")

        # 5. Enterprise plan hover (roaming flight across screen)
        print("Hovering Enterprise plan card...")
        ent_card = page.locator('text=Contact Engineering').locator('xpath=ancestor::div[contains(@class, "rounded-3xl")][1]')
        ent_card.hover(force=True)
        time.sleep(2.0)
        page.screenshot(path="public/qa_expr_enterprise.png")

        # 6. Mouse leave - restore neutral
        print("Leaving cards to restore neutral...")
        page.mouse.move(50, 50)
        time.sleep(1.5)
        page.screenshot(path="public/qa_expr_restored_neutral.png")

        # 7. Mobile viewport touch selection test
        print("Testing mobile viewport touch selection...")
        mobile_page = browser.new_page(viewport={"width": 390, "height": 844})
        mobile_page.goto("http://localhost:5173/#/pricing", wait_until="domcontentloaded")
        time.sleep(2.0)
        # Tap Pro plan
        mobile_pro = mobile_page.locator('text=Get OSMOO Pro').locator('xpath=ancestor::div[contains(@class, "rounded-3xl")][1]')
        mobile_pro.click(force=True)
        time.sleep(1.0)
        mobile_page.screenshot(path="public/qa_expr_mobile_pro.png")
        mobile_page.close()

        browser.close()

    print(f"Test finished! Total console errors: {len(console_errors)}")
    if console_errors:
        print("Errors encountered:", console_errors)

if __name__ == '__main__':
    test_pricing_expressions()
