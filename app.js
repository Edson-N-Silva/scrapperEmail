const fetch = require('node-fetch');
const cheerio = require('cheerio');
require('dotenv').config();
const nodemailer = require('nodemailer');

// URL da página que contém a mensagem específica
const url = 'https://www.mundodasmensagens.com/mensagens-amor/';

async function fetchData() {
    try {
        // Faz a requisição para a página
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Seleciona o elemento específico com ID 3944
        const titulo = $('#3944 .boxtitle').text().trim();
        const textoMensagem = $('#3944 .copy-text').text().trim();

        if (titulo && textoMensagem) {
            const mensagem = {
                titulo,
                textoMensagem,
            };

            // Envia apenas a mensagem com ID 3944 por e-mail
            sendEmail(mensagem);
        } else {
            console.log('Mensagem com ID 3944 não encontrada.');
        }
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

// Configuração de transporte de e-mail
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendEmail(mensagem) {
    try {
        // Monta o conteúdo do e-mail com a mensagem específica
        const conteudoEmail = `${mensagem.titulo}\n\n\n${mensagem.textoMensagem}\n\n`;

        // Envia o e-mail
        const info = await transporter.sendMail({
            from: `"Remetente" <${process.env.EMAIL_USER}>`,
            to: `${process.env.EMAIL_RECEBER}`,
            subject: 'Mensagem de Amor - Eu quero você para mim',
            text: conteudoEmail,
        });

        console.log('E-mail enviado: %s', info.messageId);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}

// Executa o scraper
fetchData();
