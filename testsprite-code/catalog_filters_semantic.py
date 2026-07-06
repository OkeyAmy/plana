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
        await page.get_by_role("button", name="Data viz").click()
        await expect(page.get_by_text(re.compile(r"showing\s+7\s*/\s*21", re.I))).to_be_visible()
        for name in ["BarChart", "HorizontalBarChart", "LineChart", "DonutChart", "ScatterChart", "DataTable"]:
            await expect(page.get_by_text(name, exact=True).first()).to_be_visible()
        await page.get_by_role("button", name="Interactive").click()
        await expect(page.get_by_text(re.compile(r"showing\s+2\s*/\s*21", re.I))).to_be_visible()
        await expect(page.get_by_text("Button", exact=True).first()).to_be_visible()
        await expect(page.get_by_text("ChoiceChips", exact=True).first()).to_be_visible()
        await page.get_by_role("button", name="All").click()
        await expect(page.get_by_text(re.compile(r"showing\s+21\s*/\s*21", re.I))).to_be_visible()

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
