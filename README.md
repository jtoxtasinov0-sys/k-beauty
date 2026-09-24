# ✨ Colibri Cosmetics

Telegram Mini App + Bot + Admin Panel — Koreya kosmetikasi uchun online do'kon.
Narxlar Koreya wonida (₩), donaga va optom. Yetkazib berish: 🇰🇷 Koreya ichi va 🇺🇿 O'zbekiston.

Bot nomini o'zgartirish: [docs/BOT-NOMI.md](docs/BOT-NOMI.md)

```
K-beauty/
├── backend/     Node.js — Telegram bot + REST API + Prisma
├── miniapp/     React — mijozlar uchun Telegram Mini App
└── admin/       React — ma'murlar uchun boshqaruv paneli
```

---

## 1. Paketlarni o'rnatish

Har bir papka uchun alohida (bir marta bajariladi):

```bash
cd backend && npm install
```

```bash
cd miniapp && npm install
```

```bash
cd admin && npm install
```

---

## 2. Neon bazasini ulash

`backend/.env` faylini oching va `DATABASE_URL` qatoriga Neon connection string'ni qo'ying:

```
DATABASE_URL="postgresql://neondb_owner:PAROL@ep-xxx.aws.neon.tech/neondb?sslmode=require"
```

> Neon → loyihangiz → **Connection string** → **Prisma** yoki **Pooled connection** → Copy.

---

## 3. Bazani tayyorlash va mahsulotlarni yozish

`backend` papkasida:

```bash
npm run db:push
```

```bash
npm run db:seed
```

Seed 16 ta mahsulotni bazaga yozadi (ANUA, MEDIPEEL, LACTOFIT, AXIS-Y).
Hammasini o'chirib qaytadan yozish kerak bo'lsa:

```bash
npm run db:seed -- --reset
```

Bazani ko'z bilan ko'rish uchun:

```bash
npm run db:studio
```

---

## 4. Localhost'da ishga tushirish

**3 ta alohida terminal** kerak bo'ladi.

**1-terminal — Backend + Bot** (`backend` papkasida):

```bash
npm run dev
```

→ API: http://localhost:4000 · Bot polling rejimida ishlay boshlaydi

**2-terminal — Mini App** (`miniapp` papkasida):

```bash
npm run dev
```

→ http://localhost:5173

**3-terminal — Admin Panel** (`admin` papkasida):

```bash
npm run dev
```

→ http://localhost:5174 · Parol: `kbeauty2025` (`backend/.env` dagi `ADMIN_PASSWORD`)

> Mini App'ni brauzerdan ham ochib ko'rish mumkin — `ALLOW_INSECURE_AUTH=true` bo'lgani
> uchun test mijoz sifatida kirasiz. Telegramda ishlatganda esa haqiqiy hisobingiz ishlaydi.

---

## 5. Telegramga ulash (cloudflared)

Telegram Mini App faqat **https** havolani qabul qiladi, shuning uchun localhost'ni
tashqariga chiqaramiz. Buning uchun **cloudflared** ishlatiladi — u kompyuteringizda
allaqachon o'rnatilgan, ro'yxatdan o'tish va authtoken kerak emas.

### 5.1. Tunnel ochish

**4-terminal** oching:

```bash
cloudflared tunnel --url http://localhost:5173
```

Bir necha soniyadan keyin ramka ichida shunday havola chiqadi:

```
https://person-formula-consciousness-constraint.trycloudflare.com
```

Shu `https://...trycloudflare.com` havolasini ko'chirib oling.

> ⚠️ Faqat **5173** portini tunnel qilish kifoya. API (`/api`) va rasmlar (`/uploads`)
> Vite proxy orqali avtomatik ravishda 4000-portga uzatiladi — ikkinchi tunnel shart emas.

### 5.2. Havolani botga ulash

`backend/.env` faylida `WEBAPP_URL` ni yangilang:

```
WEBAPP_URL="https://person-formula-consciousness-constraint.trycloudflare.com"
```

Backend terminalini **to'xtatib qayta ishga tushiring** (`Ctrl + C`, keyin `npm run dev`).
Dastur o'zi Telegram menu tugmasini o'rnatadi:

```
📱 Menu tugmasi o'rnatildi: https://person-formula-....trycloudflare.com
```

### 5.3. Tekshirish

1. Telegramda botni oching: [@K_Beauty_Store_Optom_bot](https://t.me/K_Beauty_Store_Optom_bot)
2. `/start` bosing → **🛍 Do'konni ochish** tugmasi chiqadi
3. Yoki chat pastidagi **Do'kon** menu tugmasini bosing

> ⚠️ Har safar `cloudflared` qayta ishga tushirilganda **havola o'zgaradi** — yangi havolani
> `WEBAPP_URL` ga qayta qo'yib, backendni restart qiling. Tunnel terminalini yopmang!

### 5.4. Kompyuterni o'chirsangiz nima bo'ladi?

Tunnel havolasi **o'ladi** va Telegram'da **Error 1033** chiqadi. Bu normal holat —
tunnel faqat kompyuter yoqiq turganda ishlaydi.

- **Internetdagi do'kon buzilmaydi:** u Vercel + Render'da alohida ishlaydi
  (→ `DEPLOY.md`). Bot o'zi doimiy havolaga qaytadi.
- **Eski xabardagi tugma baribir ochilmaydi** — Telegram uni yuborilgan paytdagi
  havola bilan saqlab qo'yadi. Botga **`/start`** yoki **`/menu`** yuboring,
  yangi ishlaydigan tugma keladi.
- Localhost'da qayta ishlamoqchi bo'lsangiz: `cloudflared` ni qayta oching,
  yangi havolani `WEBAPP_URL` ga qo'ying va backendni restart qiling.

### 5.5. ngrok ishlatmoqchi bo'lsangiz (ixtiyoriy)

cloudflared yetarli, lekin ngrok kerak bo'lsa: https://ngrok.com da ro'yxatdan o'ting,
dasturni yuklab oling, `ngrok config add-authtoken SIZNING_TOKEN` bajaring va
`ngrok http 5173` bilan ishlating. Qolgan qadamlar yuqoridagi bilan bir xil.

---

## 6. BotFather'da qo'lda sozlash (ixtiyoriy)

Agar menu tugmasi avtomatik o'rnatilmasa:

1. Telegramda **@BotFather** → `/mybots`
2. `@K_Beauty_Store_Optom_bot` ni tanlang
3. **Bot Settings** → **Menu Button** → **Configure Menu Button**
4. ngrok havolasini yuboring, keyin tugma nomini yozing: `Do'kon`

---

## 7. Til (o'zbekcha / ruscha)

Yangi mijoz botga birinchi marta `/start` yozganda bot avval **tilni so'raydi**:

```
Tilni tanlang / Выберите язык 👇
[🇺🇿 O'zbekcha]  [🇷🇺 Русский]
```

Tanlov `users.language` ustuniga yoziladi va shundan keyin **hamma narsa**
o'sha tilda bo'ladi: salomlashuv, `/help`, buyurtma tasdig'i, holat xabarlari
va Mini App interfeysi.

| Qadam | Nima bo'ladi |
|---|---|
| Yangi mijoz `/start` bosdi | Til so'raladi (bir marta) |
| Tanladi | Bazaga yoziladi, salomlashuv o'sha tilda keladi |
| Qayta `/start` bosdi | Qayta so'ralmaydi — to'g'ridan-to'g'ri salomlashuv |
| Tilni almashtirmoqchi | Botga `/til` yozadi |
| Mini App'ni ochdi | Botda tanlagan tilida ochiladi — qayta so'ralmaydi |
| Mini App'dagi UZ/RU tugmasi bilan almashtirdi | Serverga saqlanadi — bot ham o'sha tilga o'tadi |

Til **faqat botda** so'raladi — Mini App ichida alohida til ekrani yo'q.
App botda tanlangan tilni o'zi oladi, almashtirish kerak bo'lsa yuqoridagi
UZ/RU tugmasi yoki Profil bo'limi orqali qilinadi.

> Bu funksiya qo'shilishidan **oldin** ro'yxatdan o'tgan mijozlardan til
> so'ralmaydi — ularga Telegram tilidan taxmin qilingan til qo'yilgan.
> Ular `/til` orqali o'zgartira oladi.
>
> Botga `/start` bosmasdan, to'g'ridan-to'g'ri menyu tugmasi orqali kirgan
> mijozga Telegram tilidan taxmin qilingan til qo'yiladi.

Bot buyruqlari: `/start` · `/menu` · `/til` · `/id` · `/help`

---

## 8. Storylar (bosh sahifadagi dumaloqlar)

Mijozning bosh sahifasida yuqorida dumaloq storylar turadi — Instagram'dagidek.
Ro'yxat **admin panelda** tuziladi, kodda hech narsa o'ylab topilmaydi.

### Mijoz tomonda

| Harakat | Nima bo'ladi |
|---|---|
| Storyni bosdi | To'liq ekranda rasm ochiladi (katalogga o'tib ketmaydi) |
| O'ng tomonga bosdi | Keyingi story |
| Chap chetiga bosdi | Oldingi story |
| Hech narsa qilmadi | 5 soniyada o'zi keyingisiga o'tadi, oxirida yopiladi |
| Mahsulotga bog'langan story | Pastda **"Mahsulotni ochish"** tugmasi chiqadi |

### Admin panelda: 🎬 Storylar

- **➕ Yangi story** → ro'yxatdan mahsulot tanlang — rasm va sarlavha
  **o'zi to'ldiriladi**. Mijoz storyni bosganda o'sha mahsulot ochiladi.
- Mahsulotsiz ham bo'ladi: o'z rasmingizni yuklab, faqat e'lon sifatida qo'ying.
- **Tartib raqami** — kichik raqam chapda turadi.

### Kunda almashtirib turish

Eskisini **o'chirmang** — «Faol» tugmasini bosib o'chirib qo'ying. Faqat faol
storylar mijozga ko'rinadi. Ertasiga yana bir bosishda qaytarasiz.

Masalan, 7 ta story tayyorlab qo'ysangiz, har kuni bittasini yoqib,
qolganini o'chirib qo'yish kifoya — qayta yuklash shart emas.

> Story qo'shilmagan bo'lsa, dumaloqlar qatori umuman ko'rinmaydi —
> bo'sh joy qolmaydi.

> ⚙️ `stories` jadvali bazada **o'zi yaratiladi** (server ishga tushganda
> tekshiriladi) — Neon'da qo'lda hech narsa qilish shart emas.

---

## 9. Qanday ishlaydi

| Qadam | Nima bo'ladi |
|---|---|
| Mijoz katalogdan mahsulot tanlaydi | Soni `minWholesaleQty` ga yetsa — narx avtomatik **optomga** o'tadi |
| "Buyurtmani tasdiqlash" bosiladi | Mintaqa (🇰🇷/🇺🇿), ism, telefon, manzil olinadi |
| Buyurtma yuboriladi | Narxlar serverda **qayta hisoblanadi**, bazaga yoziladi |
| Mini App yopiladi | Bot mijozga tasdiq xabarini yuboradi |
| Admin Panel | Buyurtma darhol ko'rinadi (har 15 soniyada o'zi yangilanadi) |
| Admin holatni o'zgartirsa | Mijozga bot orqali xabar boradi |

---

## 10. Admin Panel

- **📦 Buyurtmalar** — mijoz ismi, telefoni, nima olgani, optom belgisi, jami summa, manzil, sana.
  Holatni o'zgartirish: Yangi → Tasdiqlandi → Jo'natildi → Yetkazildi.
- **👥 Mijozlar** — kim kirgan, qaysi Telegram profilidan va qaysi raqamdan.
  Qatorni bosing — to'liq kartochka ochiladi: @username, Telegram ID, telefon,
  til, birinchi kirgan sana, oxirgi faollik va barcha buyurtmalari.
  Ism, @username, telefon yoki ID bo'yicha qidirish bor.
  Buyurtmalar bo'limida ham mijoz ustiga bossangiz shu kartochka ochiladi.
- **🎬 Storylar** — bosh sahifadagi dumaloqlar. «Faol» belgisi bilan kunda almashtiriladi (7-bo'lim).
- **🧴 Mahsulotlar** — qo'shish, tahrirlash, o'chirish.
  Rasm **galereyadan** yuklanadi (`📷 Galereyadan rasm tanlash`), maksimal 8 MB.
  "Nalichi" belgisini jadvalda bir bosishda o'zgartirsa bo'ladi.

**Mahsulot qo'shishda:**
- *Donaga narx* — majburiy
- *Optom narx* — bo'sh qoldirilsa donaga narx bilan bir xil bo'ladi
- *Minimal optom soni* — mijoz shu sondan ko'p olsa optom narx qo'llanadi
- *Srogi* — kalendardan tanlanadi, katalog kartochkasida ko'rinadi
- *Tarkibi* — har qatorni `•` bilan boshlang, Mini App'da ro'yxat bo'lib chiqadi

---

## 11. Muhim eslatmalar

- `backend/.env` faylini hech kimga bermang va GitHub'ga yuklamang — bot tokeni va baza paroli shunda.
- Loyihani haqiqiy foydalanuvchilarga ochishdan oldin `ALLOW_INSECURE_AUTH=false` qiling
  va `ADMIN_PASSWORD` ni murakkabroq parolga almashtiring.
- Seed'da faqat bitta narx ma'lum bo'lgan mahsulotlarda **dona = optom** qilib qo'yilgan.
  Admin Panelda optom narxlarni tuzatib chiqing.
