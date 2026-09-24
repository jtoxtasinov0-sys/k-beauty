# Bot nomini "Colibri Cosmetics" ga o'zgartirish

Telegram botda 4 xil "nom" bor. Ularni aralashtirmaslik kerak:

| Nima | Hozir | Yangi | Qanday o'zgaradi |
|---|---|---|---|
| **Ko'rinadigan nom** (chat tepasida) | K-Beauty Store Optom | Colibri Cosmetics | Avtomatik (server) yoki BotFather |
| **Qisqa tavsif** (profilda "About") | — | Koreyadan original kosmetika… | Avtomatik (server) yoki BotFather |
| **Tavsif** (bo'sh chatda "Start" dan oldin) | — | Colibri Cosmetics ✨ … | Avtomatik (server) yoki BotFather |
| **Rasm (avatar)** | eski | `docs/bot-avatar.png` | Faqat BotFather orqali |
| **Username** (`@...`) | `@K_Beauty_Store_Optom_bot` | — | Pastdagi 4-bo'limni o'qing |

---

## 1. Avtomatik usul (hech narsa qilish shart emas)

Server (Render) yangi kod bilan qayta ishga tushganda bot **o'zi** nomini,
qisqa tavsifini va tavsifini o'zbek va rus tillarida "Colibri Cosmetics" ga
o'zgartiradi. Render loglarida shunday qator chiqadi:

```
🏷  Bot nomi yangilandi (standart): Colibri Cosmetics
```

Matnni o'zgartirmoqchi bo'lsangiz — `backend/src/core/bot.js` dagi
`BOT_PROFILE` ni tahrirlang.

> Telegram nomni o'zgartirishni kuniga bir necha marta bilan cheklaydi.
> Shuning uchun kod faqat nom farq qilsagina yozadi.

## 2. Qo'lda — BotFather orqali (nom va tavsif)

Agar avtomatik ishlamasa yoki darhol ko'rmoqchi bo'lsangiz:

1. Telegramda [@BotFather](https://t.me/BotFather) ni oching
2. `/mybots` yuboring → **K_Beauty_Store_Optom_bot** ni tanlang
3. **Edit Bot** tugmasini bosing
4. **Edit Name** → yuboring: `Colibri Cosmetics`
5. **Edit About** → yuboring:
   `Koreyadan original kosmetika — donaga va optom narxlarda ✨`
6. **Edit Description** → yuboring:
   ```
   Colibri Cosmetics ✨

   Koreyadan original kosmetika — donaga va optom narxlarda.
   Koreya ichi va O‘zbekistonga yetkazib berish.

   «Start» tugmasini bosing 👇
   ```

## 3. Avatar (rasm) — faqat qo'lda

1. Shu repozitoriydagi `docs/bot-avatar.png` ni telefoningizga yuklab oling
   (GitHub'da faylni oching → **Download**)
2. @BotFather → `/mybots` → botingiz → **Edit Bot** → **Edit Botpic**
3. Rasmni **rasm sifatida** yuboring (fayl emas)

Mijozlarda yangi rasm va nom bir necha daqiqadan keyin ko'rinadi
(ba'zan Telegramni qayta ochish kerak).

## 4. Username (`@K_Beauty_Store_Optom_bot`) haqida

Username — botning manzili. Uni oddiy yo'l bilan o'zgartirib bo'lmaydi va
**o'zgartirish shart ham emas**: mijozlar chat tepasida endi
"Colibri Cosmetics" ni ko'rishadi.

Agar baribir `@ColibriCosmeticsBot` kabi manzil kerak bo'lsa:

- **Yangi bot ochish** — @BotFather → `/newbot`. Lekin bu boshqa bot:
  eski mijozlar u yerga avtomatik o'tmaydi, yangi `BOT_TOKEN` va
  `BOT_USERNAME` ni Render → Environment ga yozish kerak bo'ladi.
  Tavsiya qilinmaydi — mijozlarni yo'qotasiz.
- Tavsiya: eski username qolsin, faqat nom va rasm o'zgarsin.

## 5. Tekshirish

- [ ] Botni ochdim — tepada **Colibri Cosmetics** yozuvi
- [ ] Rasm — oltin kolibri, feruza fon
- [ ] `/start` — "Colibri Cosmetics ✨🇰🇷" xabari keldi
- [ ] Do'kon tugmasi — Mini App feruza-oltin ranglarda ochildi
