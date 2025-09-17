const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Página carregada com sucesso!');
  } catch (e) {
    console.error('Erro no goto:', e.message);
  }
})();