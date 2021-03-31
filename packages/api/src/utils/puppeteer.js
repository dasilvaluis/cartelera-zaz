import puppeteer from 'puppeteer';

export async function openNewPage(browser) {
  const page = await browser.newPage();

  async function closePage() {
    await page.close();
  }

  return { page, closePage };
}

export async function startNewBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  async function closeBrowser() {
    await browser.close();
  }

  const { page: browserPage } = await openNewPage(browser);

  return {
    browser,
    browserPage,
    openNewPage,
    closeBrowser,
  };
}
