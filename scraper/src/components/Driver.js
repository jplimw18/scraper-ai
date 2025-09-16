const puppeteer = require('puppeteer');

const configPuppeteer = async (url) => {
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();

        await page.goto(url);
        await page.setViewport({ width: 1080, height: 1024 });

        return { success: true, browser, page};
    } catch (e) {
        return { success: false };
    }
};

module.exports = {
    configPuppeteer,
};