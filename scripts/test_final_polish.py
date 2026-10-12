import time
import os
from playwright.sync_api import sync_playwright

def run_final_polish_tests():
    console_errors = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        
        # ─── 1. DESKTOP 1440px VIEWPORT TEST ──────────────────────────────────
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        print("Navigating to Home (1440px)...")
        page.goto("http://localhost:5173/#/home", wait_until="domcontentloaded")
        time.sleep(2.5)
        page.screenshot(path="public/final_home_hero_1440.png")

        # Verify Audio Toggle is initially OFF (opt-in)
        audio_btn = page.locator('button[aria-label="Enable audio effects"]')
        assert audio_btn.is_visible(), "Audio toggle should be present and default to disabled"
        print("[OK] Audio toggle correctly defaults to opt-in disabled (OFF)")

        # Test toggling audio ON
        audio_btn.click()
        time.sleep(0.5)
        audio_on_btn = page.locator('button[aria-label="Disable audio effects"]')
        assert audio_on_btn.is_visible(), "Audio toggle should switch to enabled state"
        print("[OK] Audio toggle successfully switches to enabled (ON)")
        page.screenshot(path="public/final_audio_toggle_on.png")

        # Scroll Home to mid-page and bottom to test scroll-linked 3D bot path
        print("Scrolling Home to Showcase...")
        page.evaluate("window.scrollTo({ top: 1200, behavior: 'instant' })")
        time.sleep(1.5)
        page.screenshot(path="public/final_home_mid_scroll.png")

        print("Scrolling Home to Ecosystem/Footer...")
        page.evaluate("window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })")
        time.sleep(1.5)
        page.screenshot(path="public/final_home_bottom_scroll.png")

        # Test "Get OSMOO" modal trigger
        print("Testing Get OSMOO Modal...")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'instant' })")
        time.sleep(0.5)
        get_osmoo_btn = page.locator('button:has-text("Get OSMOO")').first
        get_osmoo_btn.click()
        time.sleep(1.0)
        page.screenshot(path="public/final_modal_open.png")
        # Close modal
        close_modal_btn = page.locator('button[aria-label="Close modal"]').first
        if close_modal_btn.is_visible():
            close_modal_btn.click(force=True)
            time.sleep(0.5)
        else:
            page.keyboard.press("Escape")
            time.sleep(0.5)

        # ─── 2. PRICING EXPRESSIONS & CARD-DIRECTED GAZE ──────────────────────
        print("Navigating to Pricing page...")
        page.goto("http://localhost:5173/#/pricing", wait_until="domcontentloaded")
        time.sleep(2.0)
        page.screenshot(path="public/final_pricing_neutral.png")

        # Hover Free
        print("Testing Free Plan hover...")
        free_card = page.locator('text=Download Free').locator('xpath=ancestor::div[contains(@class, "rounded-3xl")][1]')
        free_card.hover(force=True)
        time.sleep(1.2)
        page.screenshot(path="public/final_pricing_free_hover.png")

        # Hover Pro
        print("Testing Pro Plan hover...")
        pro_card = page.locator('text=Get OSMOO Pro').locator('xpath=ancestor::div[contains(@class, "rounded-3xl")][1]')
        pro_card.hover(force=True)
        time.sleep(1.2)
        page.screenshot(path="public/final_pricing_pro_hover.png")

        # Hover Max
        print("Testing Max Plan hover...")
        max_card = page.locator('text=Request Max Access').locator('xpath=ancestor::div[contains(@class, "rounded-3xl")][1]')
        max_card.hover(force=True)
        time.sleep(1.2)
        page.screenshot(path="public/final_pricing_max_hover.png")

        # Hover Enterprise
        print("Testing Enterprise Plan hover...")
        ent_card = page.locator('text=Contact Engineering').locator('xpath=ancestor::div[contains(@class, "rounded-3xl")][1]')
        ent_card.hover(force=True)
        time.sleep(2.0)
        page.screenshot(path="public/final_pricing_enterprise_hover.png")

        # ─── 3. OTHER PAGES NAVIGATION ────────────────────────────────────────
        print("Navigating to How It Works...")
        page.goto("http://localhost:5173/#/how-it-works", wait_until="domcontentloaded")
        time.sleep(1.5)
        page.screenshot(path="public/final_page_how_it_works.png")

        print("Navigating to Privacy & Security...")
        page.goto("http://localhost:5173/#/privacy", wait_until="domcontentloaded")
        time.sleep(1.5)
        page.screenshot(path="public/final_page_privacy.png")

        print("Navigating to FAQ...")
        page.goto("http://localhost:5173/#/faq", wait_until="domcontentloaded")
        time.sleep(1.5)
        page.screenshot(path="public/final_page_faq.png")

        page.close()

        # ─── 4. RESPONSIVE VIEWPORT TESTS ─────────────────────────────────────
        viewports = [
            ("1024_tablet_land", 1024, 768),
            ("768_tablet_port", 768, 1024),
            ("390_mobile", 390, 844),
            ("360_narrow", 360, 740),
        ]

        for name, w, h in viewports:
            print(f"Testing viewport {name} ({w}x{h})...")
            resp_page = browser.new_page(viewport={"width": w, "height": h})
            resp_page.goto("http://localhost:5173/#/home", wait_until="domcontentloaded")
            time.sleep(2.0)
            resp_page.screenshot(path=f"public/final_responsive_{name}.png")
            resp_page.close()

        browser.close()

    print(f"Final polish tests complete! Total console errors: {len(console_errors)}")
    if console_errors:
        print("Console errors detected:", console_errors)

if __name__ == '__main__':
    run_final_polish_tests()
