const puppeteer = require('puppeteer-extra');
const StealthPLugin = require('puppeteer-extra-plugin-stealth');

const configPuppeteer = async (url) => {
    try {

        puppeteer.use(StealthPLugin());
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ],
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36');

        await page.setExtraHTTPHeaders({'accept-language': 'pt-BR,pt;q=0.9',});

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await page.setViewport({ width: 1024, height: 1024 });

        return { success: true, browser, page };
    } catch (e) {
        return { success: false, browser: null, page: null };
    }
};

module.exports = {
    configPuppeteer,
};