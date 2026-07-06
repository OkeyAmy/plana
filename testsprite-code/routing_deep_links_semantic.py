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
        await page.goto(BASE_URL + "/catalog")
        await page.wait_for_load_state("domcontentloaded")
        await expect(page).to_have_url(re.compile(r"/catalog/?$"))
        await expect(page.get_by_text("COMPONENT CATALOG", exact=True)).to_be_visible()
        await page.goto(BASE_URL + "/dynamic")
        await page.wait_for_load_state("domcontentloaded")
        await expect(page).to_have_url(re.compile(r"/dynamic/?$"))
        await expect(page.get_by_text("Canvas is empty", exact=True)).to_be_visible()
        await page.goto(BASE_URL + "/fixed")
        await page.wait_for_load_state("domcontentloaded")
        await expect(page).to_have_url(re.compile(r"/fixed/?$"))
        await expect(page.get_by_text("Room Designer", exact=True)).to_be_visible()
        await page.locator("header").get_by_role("link", name="Plana").click()
        await expect(page).to_have_url(re.compile(r"/$"))
        await expect(page.locator("h1")).to_contain_text("Design your room")

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
