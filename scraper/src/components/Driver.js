const puppeteer = require('puppeteer-extra');
const StealthPLugin = require('puppeteer-extra-plugin-stealth');
const { randomDelay } = require('../util/Delay');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { executablePath } = require('puppeteer');

const UAS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 13; SM-G990B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0'
];

function pickUA() {
  return UAS[Math.floor(Math.random() * UAS.length)];
}

function getChromeExecutable() {
  const platform = os.platform();

  if (platform === 'win32') {
    const paths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  } else if (platform === 'darwin') {
    const p = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(p)) return p;
  } else if (platform === 'linux') {
    const candidates = [
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium'
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
  }

  throw new Error('Chrome/Chromium não encontrado no sistema.');
}

puppeteer.use(StealthPLugin());

const configPuppeteer = async (url, headless = false) => {
    let browser = null;

    try {
        const execPath = getChromeExecutable();

        browser = await puppeteer.launch({
            executablePath: execPath,
            headless: "new",
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        const page = await browser.newPage();
        await page.setUserAgent(pickUA());
        await page.setExtraHTTPHeaders({'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8',});
        await page.setViewport({ width: 1080, height: 1024 });

        await page.mouse.move(100, 200);
        await randomDelay(5000, 9000);
        await page.mouse.click(120, 220);
        await randomDelay(3000, 7000);
        await page.keyboard.press('ArrowDown');
        await randomDelay(1000, 4000);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        return { success: true, browser, page };
    } catch (e) {
        if (browser) await browser.close()
        return { success: false, browser: null, page: null };
    }
};

module.exports = {
    configPuppeteer,
};