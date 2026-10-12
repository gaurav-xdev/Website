from playwright.sync_api import sync_playwright
import time

url = "http://localhost:5173/"
output_path = r"c:\Users\gaurav\Downloads\OSMOO\public\browser_screenshot_1024x740.png"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 1024, "height": 740}, device_scale_factor=1)
    page.goto(url)
    
    # Wait for WebGL canvas and 3D model to load
    page.wait_for_selector("canvas", timeout=10000)
    time.sleep(5.5) # Allow 3D scene, PBR materials, and GLB model to compile and stabilize
    
    page.screenshot(path=output_path, full_page=False)
    browser.close()

print(f"Captured browser screenshot at {output_path}")
