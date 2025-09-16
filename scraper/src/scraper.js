const puppeteer = require('puppeteer');

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
        return { success: false };
    }

    return { success: true, products };
};

const scrape = async (page, productslink) => {
    const productData = [];
    
    for (const link of productslink) {
        try {
            console.log(`Acessando produto: ${link}`);
            await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });

            const table = await page.locator();

        } catch (e) {
            console.error(`Falha em ${link}: \n${e}`);
        }
    }
};