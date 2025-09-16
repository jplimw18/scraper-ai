const { configPuppeteer } = require('./components/Driver');
const scraper = require('./scraper');
require('dotenv').config();


const target = process.env.TARGET_URL;
console.log('iniciando scraper...');

try {
    if (!target)
        throw new Error('Não foi possível recuperar a url do site alvo');

    const driver = configPuppeteer(target);
        let browser;
        let page;
    
        if (driver.success) {
            browser = driver.browser;
            page = driver.page;
        }
} catch (e) {
    console.error(e);
}

