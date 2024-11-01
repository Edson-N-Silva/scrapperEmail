const fetch = require('node-fetch');
const cheerio = require('cheerio');
require('dotenv').config();
const nodemailer = require('nodemailer');

const url = 'https://ge.globo.com/futebol/futebol-internacional/liga-dos-campeoes/';

async function fetchData() {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        const tabelaStatus = $('.ranking-item-wrapper');
        const tabelaJogador = [];

        tabelaStatus.each(function () {
            const nomeJogador = $(this).find('.jogador-nome').text().trim();
            const posicaoJogador = $(this).find('.jogador-posicao').text().trim();
            const numeroGols = $(this).find('.jogador-gols').text().trim();
            const rankingJogador = $(this).find('.ranking-item').text()?.trim();

            if (nomeJogador && posicaoJogador && numeroGols && rankingJogador) {
                tabelaJogador.push({
                    nomeJogador,
                    posicaoJogador,
                    numeroGols,
                    rankingJogador,
                });
            }
        });

        const top5Jogadores = tabelaJogador.slice(0, 5);
        sendEmail(top5Jogadores);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


async function sendEmail(top5Jogadores) {
    try {
        const listaJogadores = top5Jogadores.map(jogador => 
            `Nome: ${jogador.nomeJogador}\nPosição: ${jogador.posicaoJogador}\nGols: ${jogador.numeroGols}\nRanking: ${jogador.rankingJogador}\n\n`
        ).join('');

        const info = await transporter.sendMail({
            from: `"Nome do Remetente" <${process.env.EMAIL_USER}>`,
            to: 'erichataina@gmail.com', 
            subject: 'Top 5 Artilheiros da UEFA', 
            text: `Top 5 Artilheiros da UEFA:\n\n${listaJogadores}`,
        });

        console.log('E-mail enviado: %s', info.messageId);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}

fetchData();
