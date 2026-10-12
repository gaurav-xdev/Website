from playwright.sync_api import sync_playwright

url = "http://localhost:5173/"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 1024, "height": 740})
    
    console_logs = []
    page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
    page_errors = []
    page.on("pageerror", lambda err: page_errors.append(str(err)))
    
    page.goto(url)
    page.wait_for_timeout(4000)
    
    print("Page errors:", page_errors)
    print("Console logs:")
    for log in console_logs:
        print(" ", log)
        
    html = page.content()
    print("HTML length:", len(html))
    print("Has canvas:", "<canvas" in html)
    print("Has root text:", "YOUR COMPUTER" in html)
    
    browser.close()
