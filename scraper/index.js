
const scraper = require('./src/scraper');
require('dotenv').config();

const target = process.env.TARGET_URL;
console.log(target);

scraper.runScraper(target).then(data => {
    if (!data  || !data.success)
    {
        console.error(data.message || `Falha ao obter dados: Um erro inesperado aconteceu.`);
        return;
    }

    console.log('dados obtidos:');
    
    for (const info of data.result)
    {
        console.log(info);
    }
});