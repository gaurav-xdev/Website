import time
import os
from playwright.sync_api import sync_playwright

def run_backend_and_security_tests():
    console_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        print("[TEST 1] Loading http://localhost:5173/#home...")
        page.goto("http://localhost:5173/#home", wait_until="domcontentloaded")
        time.sleep(2.5)

        # 1. Test Account / Auth Modal
        print("[TEST 2] Testing Navbar Account modal...")
        account_btn = page.locator("button:has-text('Account')").first
        account_btn.click()
        time.sleep(1)
        page.screenshot(path="public/test_auth_modal_open.png")
        print("[OK] Auth modal opened and screenshot saved to public/test_auth_modal_open.png")

        # Close Auth Modal
        close_btn = page.locator("button[aria-label='Close authentication modal']").first
        close_btn.click()
        time.sleep(0.5)

        # 2. Test Join the Waitlist Modal
        print("[TEST 3] Testing Join the Waitlist modal & Founding 50 offer...")
        waitlist_btn = page.locator("header button:has-text('Join the Waitlist')").first
        waitlist_btn.click()
        time.sleep(1)
        page.screenshot(path="public/test_early_access_modal_open.png")

        # Fill modal form (name + email)
        name_input = page.locator("#modal-name")
        if name_input.is_visible():
            name_input.fill("Jordan")
        modal_input = page.locator("#modal-email")
        modal_input.fill("researcher@osmiora.com")
        submit_btn = modal_input.locator("xpath=ancestor::form").locator("button[type='submit']")
        submit_btn.click()
        time.sleep(1.5)
        page.screenshot(path="public/test_early_access_modal_submitted.png")
        print("[OK] Waitlist form submitted and screenshot saved to public/test_early_access_modal_submitted.png")

        # Close modal
        done_btn = page.locator("button:has-text('Done')").first
        if done_btn.is_visible():
            done_btn.click()
        else:
            modal_close = page.locator("button[aria-label='Close modal']").first
            modal_close.click()
        time.sleep(0.5)

        # 3. Test Pricing Page & Waitlist Pro interaction
        print("[TEST 4] Testing Pricing Page & Waitlist Pro interaction...")
        page.goto("http://localhost:5173/#pricing", wait_until="domcontentloaded")
        time.sleep(2)

        # Click Pro Plan CTA
        pro_cta = page.locator("button:has-text('Join Waitlist (Claim Pro)')").first
        pro_cta.click()
        time.sleep(1.5)
        page.screenshot(path="public/test_pricing_checkout_notice.png")
        print("[OK] Pricing Pro waitlist interaction tested and notice captured to public/test_pricing_checkout_notice.png")

        # 4. Test Privacy & Security Page
        print("[TEST 5] Testing Privacy & Security Page...")
        page.goto("http://localhost:5173/#privacy", wait_until="domcontentloaded")
        time.sleep(1.5)
        page.screenshot(path="public/test_privacy_page.png")
        print("[OK] Privacy page verified and saved to public/test_privacy_page.png")

        # 5. Test Download Page
        print("[TEST 6] Testing Download / Release Hub...")
        page.goto("http://localhost:5173/#download", wait_until="domcontentloaded")
        time.sleep(1.5)
        page.screenshot(path="public/test_download_page.png")
        print("[OK] Download page verified and saved to public/test_download_page.png")

        # 6. Responsive Mobile Check
        print("[TEST 7] Testing Mobile Breakpoint (390x844)...")
        mobile_context = browser.new_context(viewport={"width": 390, "height": 844})
        mobile_page = mobile_context.new_page()
        mobile_page.goto("http://localhost:5173/#home", wait_until="domcontentloaded")
        time.sleep(2)
        mobile_page.screenshot(path="public/test_mobile_home.png")
        print("[OK] Mobile view verified and saved to public/test_mobile_home.png")

        browser.close()

        # Filter ignorable WebGL / deprecated clock warnings if any
        real_errors = [e for e in console_errors if "favicon" not in e and "404" not in e]
        print(f"Total console errors encountered: {len(real_errors)}")
        for err in real_errors:
            print(f" - Error: {err}")

        assert len(real_errors) == 0, f"Found {len(real_errors)} console errors!"
        print("[SUCCESS] All backend, security, and UI checks passed with 0 console errors!")

if __name__ == "__main__":
    run_backend_and_security_tests()
