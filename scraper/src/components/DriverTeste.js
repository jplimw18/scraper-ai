// components/Driver.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { sanitizeUrl } = require('../util/SanitizeUrl');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { randomDelay } = require('../util/Delay');

puppeteer.use(StealthPlugin());

// Lista curta e coerente de UAs — rotacione com moderação
const UAS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 13; SM-G990B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
];

function pickUA() {
  return UAS[Math.floor(Math.random() * UAS.length)];
}

// opcional: detectar Chrome/Chromium no sistema (se for usar puppeteer-core)
function getLocalChromeExecutable() {
  const platform = os.platform();
  if (platform === 'win32') {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe')
    ];
    for (const p of candidates) if (fs.existsSync(p)) return p;
  } else if (platform === 'darwin') {
    const p = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(p)) return p;
  } else {
    const candidates = ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'];
    for (const p of candidates) if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * options:
 *  - headless: boolean (default false for debug; true in prod)
 *  - proxy: 'http://user:pass@ip:port' or null
 *  - executablePath: optional path to chrome (overrides auto-detect)
 */
async function configPuppeteer(targetUrl, options = {}) {
  const { headless = false, proxy = null, executablePath = null } = options;
  let browser;
  try {
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-background-networking'
    ];

    if (proxy) launchArgs.push(`--proxy-server=${proxy}`);

    // Se quiser apontar um chrome/Chromium local (opcional)
    let execPath = executablePath || getLocalChromeExecutable(); // null ok -> puppeteer usa bundeld Chromium

    const launchOptions = {
      headless: headless, // false para debug
      args: launchArgs,
      defaultViewport: null,
      ignoreHTTPSErrors: true,
    };

    if (execPath) launchOptions.executablePath = execPath;

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // UA rotacionado
    const ua = pickUA();
    await page.setUserAgent(ua);

    // Extra headers coerentes
    await page.setExtraHTTPHeaders({
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8',
      // outros headers se precisar...
    });

    // Ajusta viewport coerente com o UA (mobile vs desktop)
    if (ua.includes('Mobile') || ua.includes('iPhone') || ua.includes('Android')) {
      await page.setViewport({ width: 390, height: 844, isMobile: true });
    } else {
      await page.setViewport({ width: 1280, height: 800 });
    }

    // Pequena função para simular scroll suave (útil antes de extrair)
    page.__humanScroll = async function scrollSlowly() {
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let total = 0;
          const distance = 150;
          const delay = 200;
          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            total += distance;
            if (total > document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, delay);
        });
      });
    };

    // Função para detectar títulos ou texto indicativo de "check your browser" / challenge básico
    page.__isChallengePage = async function isChallenge() {
      const text = await page.evaluate(() => document.body.innerText || '');
      const lower = text.toLowerCase();
      return (
        lower.includes('checking your browser') ||
        lower.includes('access denied') ||
        lower.includes('unusual traffic') ||
        lower.includes('please enable javascript')
      );
    };
    
    // Navega para a página alvo com espera flexível
    targetUrl = sanitizeUrl(targetUrl);
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait adicional: first DOM paint + let SPA render XHR
    await randomDelay(7000, 9000);

    // Retorna os objetos
    return { success: true, browser, page };
  } catch (err) {
    if (browser) try { await browser.close(); } catch(e){/* ignore */ }
    console.error('configPuppeteer error:', err.message || err);
    return { success: false, browser: null, page: null, message: err.message || String(err) };
  }
}

module.exports = { configPuppeteer };
