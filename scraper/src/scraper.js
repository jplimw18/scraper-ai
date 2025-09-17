const puppeteer = require('puppeteer');
const { configPuppeteer } = require('./components/Driver');
const driverTeste = require('./components/DriverTeste');
const { randomDelay } = require('../src/util/Delay');
const { DataInfo } = require('./dto/dataInfoDto');

require('dotenv').config();


const getListOfProduct = async (page) => {
    let products = [];

    try {
        await randomDelay(8000, 8000);
        await page.waitForFunction(() => {
            return document.querySelectorAll('a[data-cy="list-product"]').length > 0;
        }, { timeout: 60000 });

        const productsLink = await page.$$eval('a[data-cy="list-product"]', els =>
            els.map(a => a.getAttribute('href'))
        );

        const baseUrl = new URL(page.url()).origin;
        products = productsLink.map(link =>
        link.startsWith('http') ? link : `${baseUrl}${link}`
        );

        if (!products || products.length == 0)
            throw new Error(`A lista de produtos estava vazia.`);
    
    } catch (e) {
        console.error(e);
        return { success: false, message: e.message };
    }

    console.log(products);

    return { success: true, products };
};

const scrape = async (page, productslink) => {
    const productData = [];
    
    for (const link of productslink) {
        try {
            console.log(`Acessando produto: ${link}`);
            await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });

            const table = await page.$('table.table.table-specification');
            
            const price = await page.$eval('div[class*="priceButton"] div[class$="price_vista"]', el => el.innerText);
            const mark = await table.$eval('td.value-field.Marca', el => el.innerText);
            const model = await table.$eval('td.value-field.Modelo', el => el.innerText);
            const cpu = await table.$eval('td.value-field.Processador', el => el.innerText);
            const mem = await table.$eval('td.value-field.Memoria', el => el.innerText);
            const storage = await table.$eval('td.value-field.Armazenamento', el => el.innerText);


            productData.push(new DataInfo(mark, model, cpu, mem, storage, price));

        } catch (e) {
            console.error(`Falha em ${link}: \n${e}`);
        }

        console.log("Aguardando para a próxima requisição...");
        await randomDelay(5000, 10000);
    }

    if (!productData || productData.length == 0)
        return { success: false, message: 'Não foi possível obter os dados dos produtos' };

    return {
        success: true,
        productData
    };
};


async function runScraper(url, options = {} ) {
    let driver;
    let data;

    let { test = false, headless = false } = options;
    try {
        driver = !test ? await configPuppeteer(url, headless) : await driverTeste.configPuppeteer(url);
        if (!driver.success) 
            throw new Error(`Falha ao obter o navegador do puppeteer: ${driver.message}`);

        const resultList = await getListOfProduct(driver.page);
        if (!resultList.success)
            throw new Error(`Falha ao obter lista de itens: \n${resultList.message}`);

        const productList = resultList.products;
        const rawData = await scrape(driver.page, productList);

        if (!rawData || !rawData.success)
            throw new Error(rawData.message || `Não foi possível obter os dados da raspagem.`);

        data = rawData.productData;
    } catch (e) {
        return { success: false, message: `Não foi possível obter os dados da raspagem: ${e}` };
    }
    finally {
        if (driver && driver.browser)
            await driver.browser.close();
    }

    if (!data)
        return { success: false, message: `Não foi possível obteros dados da raspagem.` };

    return {
        success: true,
        result: data,
    };
}

module.exports = {
    runScraper
};