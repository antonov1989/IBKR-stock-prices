const TelegramBot = require('node-telegram-bot-api');
const yahooFinance = require('yahoo-finance2').default;

// Загружаем API-ключи из переменных окружения
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const STOCKS = ["AAPL", "AMZN", "MSFT", "NVDA", "GOOGL", "TSLA", "AZN"]; // Список акций

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

async function getStockPrices() {
    let prices = {};
    try {
        const results = await yahooFinance.quote(STOCKS);
        results.forEach(stock => {
            prices[stock.symbol] = stock.regularMarketPrice; // Последняя цена
        });
    } catch (error) {
        console.error("❌ Ошибка при получении данных с Yahoo Finance:", error.message);
    }
    return prices;
}

async function sendStockUpdate() {
    const prices = await getStockPrices();
    if (Object.keys(prices).length === 0) {
        return;
    }

    let message = '📊 *Сводка акций:*\n\n' +
        Object.entries(prices).map(([symbol, price]) => `${symbol}: ${price} USD`).join('\n');

    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
}

sendStockUpdate();
