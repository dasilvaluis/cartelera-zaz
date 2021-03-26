import puppeteer from 'puppeteer';

export async function startNewBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  async function closeBrowser() {
    await browser.close();
  }

  const page = await browser.newPage();

  return { browser, page, closeBrowser };
}
