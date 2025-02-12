const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Загружаем API-ключи из переменных окружения
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const IBKR_API_URL = "https://localhost:5000/v1/api"; // Адрес Client Portal API
const STOCKS = ["AAPL", "GOOGL", "TSLA"];

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

async function getCryptoPrices() {
    let prices = {};
    try {
        // Отправляем запрос к IBKR API
        const response = await axios.get(`${IBKR_API_URL}/iserver/marketdata/snapshot`, {
            params: {
                conids: STOCKS.join(","), // Символы акций
                fields: "31" // Поле "31" — это Last Price (последняя цена)
            },
            headers: { "Content-Type": "application/json" }
        });

        response.data.forEach(stock => {
            prices[stock.symbol] = stock.last; // Получаем цену
        });

    } catch (error) {
        console.error("❌ Ошибка при получении данных с IBKR:", error.message);
    }
    return prices;
}

async function sendIBKRUpdate() {
    const prices = await getCryptoPrices();
    if (Object.keys(prices).length === 0) {
        //await bot.sendMessage(TELEGRAM_CHAT_ID, '⚠️ Ошибка получения данных с Binance.');
        return;
    }

    let message = '📊 *Cводка акций:*\n\n' +
        Object.entries(prices).map(([symbol, price]) => `${symbol}: ${price} USD`).join('\n');

    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
}

sendIBKRUpdate();