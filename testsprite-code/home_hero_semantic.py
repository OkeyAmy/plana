import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

BASE_URL = "https://plana-fl0t.onrender.com"

async def run_test():
    pw = browser = context = None
    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=["--window-size=1280,720", "--disable-dev-shm-usage", "--ipc=host", "--single-process"],
        )
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        context.set_default_timeout(20000)
        page = await context.new_page()
        await page.goto(BASE_URL + "/")
        await page.wait_for_load_state("domcontentloaded")
        await expect(page.locator("header").get_by_text("Plana", exact=True)).to_be_visible()
        await expect(page.locator("h1")).to_contain_text("Design your room")
        await expect(page.locator("h1")).to_contain_text("down to the centimetre.")
        await expect(page.get_by_role("link", name=re.compile(r"Start designing", re.I))).to_be_visible()
        for label in ["Real cm", "Live", "A2UI", "Drag & drop"]:
            await expect(page.get_by_text(label, exact=True)).to_be_visible()

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
