import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("https://plana-fl0t.onrender.com/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Start designing' CTA on the homepage.
        # Start designing link
        elem = page.get_by_role('link', name='Start designing', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The browser URL path is /fixed.
        # Assert: The browser URL path contains '/fixed'.
        await expect(page).to_have_url(re.compile("/fixed"), timeout=15000), "The browser URL path contains '/fixed'."
        
        # --> The workspace header shows "Room Designer" and "Plana · AI Floor Plan Generator".
        # Assert: Workspace header contains 'Room Designer'.
        await expect(page.locator("xpath=/html/body/div[2]/div/div[2]/div/div[3]/div/div/div[1]").nth(0)).to_contain_text("Room Designer", timeout=15000), "Workspace header contains 'Room Designer'."
        # Assert: Workspace header contains 'Plana · AI Floor Plan Generator'.
        await expect(page.locator("xpath=/html/body/div[2]/div/div[2]/div/div[3]/div/div/div[1]").nth(0)).to_contain_text("Plana \u00b7 AI Floor Plan Generator", timeout=15000), "Workspace header contains 'Plana \u00b7 AI Floor Plan Generator'."
        
        # --> The status pill shows "agent ready".
        # Assert: Status pill shows "agent ready."
        await expect(page.locator("xpath=/html/body/div[2]/div/div[2]/div/div[1]/div/div/div/div/div/div/div[2]/div/div/div[1]/div").nth(0)).to_contain_text("agent ready", timeout=15000), "Status pill shows \"agent ready.\""
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    