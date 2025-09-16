const puppeteer = require('puppeteer');
const { configPuppeteer } = require('./components/Driver');
const { DataInfo } = require('./dto/dataInfoDto');

require('dotenv').config();

function randomDelay(max, min) {
    const time = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, time));
}

const getListOfProduct = async (page) => {
    const products = [];

    try {
        const productsContainer = await page.locator('div.MuiGrid2-root.MuiGrid2-container.MuiGrid2-direction-direction-xs-row.MuiGrid2-spacing-xs-3.mui-dlvf66-listAndFilter');

        for (const product of await productsContainer.all()) {
            const productLink = await product.locator('a.list-product').getAttribute('href');
            products.push(productLink);
        }

        if (!products || products.length == 0)
            throw new Error(`A lista de produtos estava vazia.`);
    
    } catch (e) {
        console.error(e);
        return { success: false, message: e.message };
    }

    return { success: true, products };
};

const scrape = async (page, productslink) => {
    const productData = [DataInfo];
    
    for (const link of productslink) {
        try {
            console.log(`Acessando produto: ${link}`);
            await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });

            const table = await page.locator('table.table.table-specification');

            const mark = table.querySelector('td.value-field.Marca').innerText;
            const model = table.querySelector('td.value-field.Modelo').innerText;
            const cpu = table.querySelector('td.value-field.Processador').innerText;
            const mem = table.querySelector('td.value-field.Memoria').innerText;
            const storage = table.querySelector('td.value-field.Armazenamento').innerText;

            productData.push(new DataInfo(mark, model, cpu, mem, storage));

        } catch (e) {
            console.error(`Falha em ${link}: \n${e}`);
        }

        console.log("Aguardando para a próxima requisição...");
        await randomDelay(2000, 5000);
    }

    if (!productData || productData.length == 0)
        return { success: false, message: 'Não foi possível obter os dados dos produtos' };

    return {
        success: true,
        productData
    };
};


async function runScraper(url) {
    let driver;
    let data;

    try {
        driver = await configPuppeteer(url);
        if (!driver.success) 
            throw new Error(`Falha ao obter o navegador do puppeteer.`);

        const resultList = await getListOfProduct(driver.page);
        if (!resultList.success)
            throw new Error(`Falha ao obter lista de itens: \n${resultList.message}`);

        const productList = resultList.products;
        const rawData = await scrape(driver.page, productList);

        if (!rawData || !rawData.success)
            throw new Error(rawData.message || `Não foi possível obter os dados da raspagem.`);

        data = rawData.productData;
    } catch (e) {
        console.error(`Falha na raspagem: \n${e.message}`);
        return { success: false, message: `Não foi possível obteros dados da raspagem.` };
    }
    finally {
        await driver.browser.close();
    }

    if (!data)
        return { success: false, message: `Não foi possível obteros dados da raspagem.` };

    return {
        success: true,
        result: JSON.parse(data),
    };
}

module.exports = {
    runScraper
};