
const { runScraper } = require('./src/scraper');
const { postScrapedData } = require('./src/apiClient');
const { sanitizeUrl } = require('./src/util/SanitizeUrl');
require('dotenv').config();

async function run() {
    const target = sanitizeUrl(process.env.TARGET_URL);
    console.log(target);
    
    const scraperResult = await runScraper(target, { test: false, headless: true });
    if (!scraperResult || !scraperResult.success) {
        console.error(scraperResult.message || 'Ocorreu um error inesperado com o scraper.');
        return;
    }

    const data = scraperResult.result;
    console.log(`Raspagem realizada com sucesso: ${data.length} objetos obtidos.`);

    const sendResult = await postScrapedData(data);

    if (!sendResult || !sendResult.success) {
        console.error(sendResult.message || 'Ocorreu um erro inesperado ao tentar enviar os dados para a API.');
        return;
    }

    console.log(`dados enviados. Resposta da API: ${sendResult.message}`);
}

run();
