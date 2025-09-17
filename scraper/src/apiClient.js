const axios = require('axios');
require('dotenv').config();


const apiClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.SCRAPER_API_KEY
    }
});


/**
 * @param {Array<Object>}
 * @returns {Promise<{success: boolean, message: String}>}
 */
async function postScrapedData(data) {
    const endpoint = '/ingest';

    console.log(`Enviando ${data.length} para a API em ${apiClient.defaults.baseURL}${endpoint}`);

    try {
        const response = await apiClient.post(endpoint, data);

        console.log(`Api response: ${response.data}`);
        return { success: true, message: 'Envio realizado com sucesso.' };
    } catch (error) {
        console.error('Falha ao enviar para a API');

        if (error.response) {
            console.error(`error status: ${error.response.status}`);
            console.error(`error data: ${error.response.data}`);
            return { success: false, message: `Erro da API: ${error.response.data.message}` };
        } else if (error.request) {
            console.error(`A requisição não obteve nenhum retorno: ${error.request}`);
            return { success: false, message: 'A API não retornou respostas.' };
        }

        console.error('Erro de configuração');
        return { success: false, message: `Erro de configuração da requisição: ${error.message}` };
    }
}

module.exports = {
    postScrapedData,
};