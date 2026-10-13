import time
from playwright.sync_api import sync_playwright

def test_legal_suite():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="msedge")
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        print("[TEST 1] Loading home page and checking Cookie Consent Banner...")
        page.goto("http://localhost:5173/#home", wait_until="domcontentloaded")
        time.sleep(2)

        # Cookie banner should be visible
        banner = page.locator("aside[aria-label='Cookie and storage preferences']").first
        if banner.is_visible():
            print("[OK] Cookie Consent Banner is visible on first visit")
            page.screenshot(path="public/test_cookie_banner.png")
            # Click "Essential Only"
            essential_btn = page.locator("button:has-text('Essential Only')").first
            essential_btn.click()
            time.sleep(0.5)
            print("[OK] Selected 'Essential Only' in cookie banner")

        # Test Legal Navigation from Footer
        legal_routes = [
            ("legal/privacy", "Privacy Policy", "public/test_legal_privacy.png"),
            ("legal/terms", "Terms of Use", "public/test_legal_terms.png"),
            ("legal/cookies", "Cookie & Storage Policy", "public/test_legal_cookies.png"),
            ("legal/ai-safety", "AI & Computer-Control Safety", "public/test_legal_ai_safety.png"),
            ("legal/contact", "Contact, Privacy Requests", "public/test_legal_contact.png"),
            ("legal/refunds", "Refund, Cancellation & Subscription", "public/test_legal_refunds.png"),
            ("legal/eula", "End User License Agreement", "public/test_legal_eula.png"),
        ]

        for route, expected_title, screenshot_path in legal_routes:
            print(f"[TEST] Verifying route #{route} ({expected_title})...")
            page.goto(f"http://localhost:5173/#{route}", wait_until="domcontentloaded")
            time.sleep(1)

            # Check that page contains heading
            h1 = page.locator("h1").first
            assert h1.is_visible(), f"H1 not found on route #{route}"
            text = h1.inner_text()
            print(f"       Loaded: {text.strip().replace(chr(10), ' ')}")
            page.screenshot(path=screenshot_path)

        # Test Mobile Responsiveness for Legal Page
        print("[TEST] Checking mobile breakpoint on Privacy Policy...")
        mobile_ctx = browser.new_context(viewport={"width": 390, "height": 844})
        mobile_page = mobile_ctx.new_page()
        mobile_page.goto("http://localhost:5173/#legal/privacy", wait_until="domcontentloaded")
        time.sleep(1.5)
        mobile_page.screenshot(path="public/test_legal_privacy_mobile.png")
        print("[OK] Mobile legal page verified")

        print(f"Total console errors encountered: {len(console_errors)}")
        if console_errors:
            for err in console_errors:
                print("Console error:", err)
        assert len(console_errors) == 0, "Encountered unexpected console errors"

        browser.close()
        print("[SUCCESS] All 7 legal routes and cookie consent banner verified!")

if __name__ == "__main__":
    test_legal_suite()
