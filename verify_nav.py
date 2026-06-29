from playwright.sync_api import sync_playwright
import time

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:8000")

        # Add mock unread counts
        page.evaluate("""() => {
            localStorage.setItem('unreadMessages', '5');
            localStorage.setItem('unreadNotifications', '2');
            window.dispatchEvent(new Event('storage'));
        }""")

        # Wait a bit for UI to update
        time.sleep(2)

        # Take screenshot
        page.screenshot(path="verification_desktop.png")

        # Also do mobile
        mobile_context = browser.new_context(
            viewport={'width': 375, 'height': 812},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
        )
        mobile_page = mobile_context.new_page()
        mobile_page.goto("http://localhost:8000")
        time.sleep(2)
        mobile_page.screenshot(path="verification_mobile.png")

        browser.close()

if __name__ == "__main__":
    verify()
