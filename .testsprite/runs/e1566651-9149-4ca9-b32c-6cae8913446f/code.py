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
        
        # --> Assertions to verify final state
        
        # --> The page shows the Plana brand in the navigation and the headline text "Design your room".
        # Assert: Navigation shows the Plana brand as "Plana".
        await expect(page.locator("xpath=/html/body/div[2]/header/div/a").nth(0)).to_have_text("Plana", timeout=15000), "Navigation shows the Plana brand as \"Plana\"."
        
        # --> The hero shows the gradient headline phrase "down to the centimetre." and the primary CTA "Start designing".
        # Assert: The hero's primary CTA is labeled 'Start designing'.
        await expect(page.locator("xpath=/html/body/div[2]/section/div[8]/div[2]/a[1]").nth(0)).to_have_text("Start designing", timeout=15000), "The hero's primary CTA is labeled 'Start designing'."
        
        # --> The social proof strip shows all four labels: "Real cm", "Live", "A2UI", and "Drag & drop".
        # Assert: Social proof shows the label "Real cm".
        await expect(page.locator("xpath=/html/body/div[2]/section/div[3]").nth(0)).to_contain_text("Real cm", timeout=15000), "Social proof shows the label \"Real cm\"."
        # Assert: Social proof shows the label "Live".
        await expect(page.locator("xpath=/html/body/div[2]/section/div[4]").nth(0)).to_contain_text("Live", timeout=15000), "Social proof shows the label \"Live\"."
        # Assert: Social proof shows the label "A2UI".
        await expect(page.locator("xpath=/html/body/div[2]/section/div[5]").nth(0)).to_contain_text("A2UI", timeout=15000), "Social proof shows the label \"A2UI\"."
        # Assert: Social proof shows the label "Drag & drop".
        await expect(page.locator("xpath=/html/body/div[2]/section/div[6]").nth(0)).to_contain_text("Drag & drop", timeout=15000), "Social proof shows the label \"Drag & drop\"."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    