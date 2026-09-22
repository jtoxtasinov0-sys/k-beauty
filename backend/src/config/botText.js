/**
 * Bot xabarlarining o'zbekcha va ruscha matnlari.
 * Mijoz qaysi tilni tanlagan bo'lsa (users.language), shu tilda yoziladi.
 */

/** 8000 -> "8 000 ₩" */
export function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ru-RU')} ₩`;
}

/** Til tanlanmagan paytda ko'rsatiladi — shuning uchun ikki tilda. */
export const ASK_LANGUAGE = 'Tilni tanlang / Выберите язык 👇';

export const LANGUAGE_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "🇺🇿 O'zbekcha", callback_data: 'lang:uz' },
      { text: '🇷🇺 Русский', callback_data: 'lang:ru' },
    ],
  ],
};

const TEXT = {
  uz: {
    langSaved: '🇺🇿 Til tanlandi: O‘zbekcha',
    openShop: '🛍 Do‘konni ochish',
    menuButton: 'Do‘kon',

    welcome: `<b>K-Beauty Store Optom</b> 🇰🇷

Koreyadan original kosmetika — <b>donaga</b> va <b>optom</b> narxlarda.

🧴 ANUA, MEDIPEEL, LACTOFIT, AXIS-Y va boshqa brendlar
📦 Koreya ichi va O‘zbekistonga yetkazib berish
💰 Ko‘p olsangiz — avtomatik optom narx

Pastdagi tugmani bosib katalogni ko‘ring 👇`,

    help: `<b>Yordam</b>

/start — do‘konni ochish
/menu — do‘kon tugmasini yangilash
/til — tilni o‘zgartirish
/id — Telegram ID raqamingiz
/help — shu xabar

ℹ️ Agar eski xabardagi tugma ochilmasa, /menu yuboring — yangi ishlaydigan tugma keladi.

Savollar bo‘lsa shu yerga yozib qoldiring, operator javob beradi.`,

    shopReady: '✅ Do‘kon tayyor — pastdagi tugmani bosing 👇',
    shopNotReady: '⚠️ Do‘kon havolasi hozir sozlanmagan. Operator bilan bog‘laning.',
    notConnected:
      '⚙️ Mini App hali ulanmagan. WEBAPP_URL ga https havola qo‘ying '
      + '(hostingda Render → Environment, kompyuterda backend/.env).',
    phoneSaved: '✅ Telefon raqamingiz saqlandi.',
    yourId: (id) => `Sizning Telegram ID: <code>${id}</code>`,

    orderTitle: '✅ <b>Buyurtmangiz muvaffaqiyatli qabul qilindi!</b>\nKuryerimiz tez orada bog‘lanadi 💄',
    orderNo: (id) => `<b>Buyurtma №${id}</b>`,
    wholesaleBadge: ' 🏷 optom',
    orderTotal: 'Jami',
    orderAddress: 'Manzil',
    orderPhone: 'Telefon',
    orderNote: '<i>Pochta narxi operator bilan alohida kelishiladi.</i>',

    status: {
      CONFIRMED: (id) => `👌 Buyurtma №${id} tasdiqlandi. Tayyorlashni boshladik!`,
      SHIPPED: (id) => `📦 Buyurtma №${id} jo‘natildi. Yo‘lda!`,
      DELIVERED: (id) => `🎉 Buyurtma №${id} yetkazildi. Xaridingiz uchun rahmat!`,
      CANCELLED: (id) => `❌ Buyurtma №${id} bekor qilindi. Savollar bo‘lsa yozing.`,
    },
  },

  ru: {
    langSaved: '🇷🇺 Язык выбран: Русский',
    openShop: '🛍 Открыть магазин',
    menuButton: 'Магазин',

    welcome: `<b>K-Beauty Store Optom</b> 🇰🇷

Оригинальная косметика из Кореи — <b>поштучно</b> и <b>оптом</b>.

🧴 ANUA, MEDIPEEL, LACTOFIT, AXIS-Y и другие бренды
📦 Доставка по Корее и в Узбекистан
💰 Берёте больше — оптовая цена применится автоматически

Нажмите кнопку ниже, чтобы открыть каталог 👇`,

    help: `<b>Помощь</b>

/start — открыть магазин
/menu — обновить кнопку магазина
/til — сменить язык
/id — ваш Telegram ID
/help — это сообщение

ℹ️ Если кнопка в старом сообщении не открывается, отправьте /menu — придёт новая рабочая кнопка.

Если есть вопросы, напишите сюда — оператор ответит.`,

    shopReady: '✅ Магазин готов — нажмите кнопку ниже 👇',
    shopNotReady: '⚠️ Ссылка на магазин сейчас не настроена. Свяжитесь с оператором.',
    notConnected:
      '⚙️ Mini App ещё не подключён. Укажите https-ссылку в WEBAPP_URL '
      + '(на хостинге: Render → Environment, на компьютере: backend/.env).',
    phoneSaved: '✅ Ваш номер телефона сохранён.',
    yourId: (id) => `Ваш Telegram ID: <code>${id}</code>`,

    orderTitle: '✅ <b>Ваш заказ принят!</b>\nНаш курьер скоро свяжется с вами 💄',
    orderNo: (id) => `<b>Заказ №${id}</b>`,
    wholesaleBadge: ' 🏷 опт',
    orderTotal: 'Итого',
    orderAddress: 'Адрес',
    orderPhone: 'Телефон',
    orderNote: '<i>Стоимость доставки обсуждается с оператором отдельно.</i>',

    status: {
      CONFIRMED: (id) => `👌 Заказ №${id} подтверждён. Начали собирать!`,
      SHIPPED: (id) => `📦 Заказ №${id} отправлен. Уже в пути!`,
      DELIVERED: (id) => `🎉 Заказ №${id} доставлен. Спасибо за покупку!`,
      CANCELLED: (id) => `❌ Заказ №${id} отменён. Если есть вопросы — напишите нам.`,
    },
  },
};

/** Tilni normallashtiradi: faqat 'uz' yoki 'ru'. */
export function normalizeLang(value) {
  return String(value || '').toLowerCase() === 'ru' ? 'ru' : 'uz';
}

/** Tanlangan tildagi matnlar to'plami. */
export function texts(lang) {
  return TEXT[normalizeLang(lang)];
}

export default texts;
