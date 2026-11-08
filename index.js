const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = process.env.BOT_TOKEN;
const ADMIN_ID = 8924595608;
const ADDRESS = 'UQAMZDQPqy0Z-_GYjV8RcBbP89JyGAFcB2NFu2udy_t9rFB6';

if (!token) process.exit(1);

const FILE = 'access.json';
let users = new Set([String(ADMIN_ID)]);

try {
  users = new Set(JSON.parse(fs.readFileSync(FILE, 'utf8')).map(String));
  users.add(String(ADMIN_ID));
} catch {}

function save() {
  fs.writeFileSync(FILE, JSON.stringify([...users]));
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/^\/start$/, msg => {
  bot.sendMessage(msg.chat.id,
    '👋 Добро пожаловать в FakeOffer!\n\n' +
    '🔐 Бессрочный доступ: 7 TON (Gram)\n\n' +
    '📬 Адрес оплаты:\n' + ADDRESS + '\n\n' +
    'После перевода отправьте /paid.\n' +
    'Администратор проверит транзакцию вручную.\n\n' +
    '⚠️ NFT-офферы доступны только в виде тестовых симуляций.'
  );
});

bot.onText(/^\/paid$/, msg => {
  bot.sendMessage(msg.chat.id, 'Заявка отправлена. Дождитесь проверки платежа.');
  bot.sendMessage(ADMIN_ID,
    '💳 Заявка об оплате\nID: ' + msg.from.id +
    '\nUsername: @' + (msg.from.username || 'не указан') +
    '\nПосле проверки используй /grant ' + msg.from.id
  );
});

bot.onText(/^\/grant\s+(\d+)$/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) return;
  users.add(match[1]);
  save();
  bot.sendMessage(msg.chat.id, '✅ Доступ выдан: ' + match[1]);
  bot.sendMessage(match[1], '✅ Доступ FakeOffer активирован!');
});

bot.onText(/^\/revoke\s+(\d+)$/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) return;
  if (match[1] === String(ADMIN_ID)) return;
  users.delete(match[1]);
  save();
  bot.sendMessage(msg.chat.id, 'Доступ отозван: ' + match[1]);
});

bot.onText(/^\/users$/, msg => {
  if (msg.from.id !== ADMIN_ID) return;
  bot.sendMessage(msg.chat.id,
    'Пользователей с доступом: ' + users.size +
    '\n' + [...users].join('\n')
  );
});

bot.onText(/^\/whoami$/, msg => {
  bot.sendMessage(msg.chat.id, 'Твой ID: ' + msg.from.id);
});

bot.onText(/^\/demo$/, msg => {
  if (!users.has(String(msg.from.id))) {
    return bot.sendMessage(msg.chat.id, '🔒 Сначала получи доступ.');
  }
  bot.sendMessage(msg.chat.id,
    '🧪 ДЕМО-ОФФЕР\n\nЭто тестовая симуляция, не реальная сделка. NFT не резервируется и средства не переводятся.'
  );
});

bot.on('polling_error', err => console.log(err.message));

console.log('FakeOffer started');
