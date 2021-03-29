import puppeteer from 'puppeteer';

export async function startNewBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  async function closeBrowser() {
    await browser.close();
  }

  const browserPage = await browser.newPage();

  return { browser, browserPage, closeBrowser };
}
