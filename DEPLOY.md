# K-Beauty Store Optom — Internetga chiqarish qo'llanmasi

Loyiha uch qismdan iborat va ular **uch xil joyda** ishlaydi:

```
  MIJOZ (Telegram)                 SIZ (brauzer)
        |                                |
        v                                v
  kbeauty-miniapp.vercel.app      kbeauty-admin.vercel.app
  (Mini App — Vercel)             (Admin panel — Vercel)
         \                             /
          \                           /
           v                         v
         kbeauty-backend.onrender.com
         (API + Telegram bot — Render)
                      |
                      v
           Neon PostgreSQL (ma'lumotlar bazasi)
```

---

## 1-QISM — Vercel (BAJARILDI ✅)

Ikkala frontend allaqachon internetda:

| Nima | Havola |
|---|---|
| Mini App (mijozlar ko'radi) | https://kbeauty-miniapp.vercel.app |
| Admin panel (siz ishlatasiz) | https://kbeauty-admin.vercel.app |

> ⚠️ **Hozir ular hali to'liq ishlamaydi** — backend manzili hali ma'lum emas.
> Render'ni tugatgach, **3-QISM** ni bajarasiz va hammasi jonlanadi.

---

## 2-QISM — Render.com (SIZ QO'LDA BAJARASIZ)

### 0-qadam. Avval shuni o'qing — bepul tarif cheklovlari

Render'ning **Free** tarifida ikkita jiddiy cheklov bor:

| Cheklov | Nimaga olib keladi |
|---|---|
| 15 daqiqa tinchlikdan keyin server **uxlab qoladi** | Bot javob bermay qo'yadi, uyg'onishi ~1 daqiqa |
| Server uxlaganda yoki qayta yuklanganda **fayllar o'chadi** | Admin paneldan yuklagan **yangi rasmlar yo'qoladi** |

Kodda turgan 21 ta rasm yo'qolmaydi — ular GitHub'da saqlanadi va har safar
qaytadan yuklanadi. Faqat **keyin qo'shgan yangi rasmlaringiz** yo'qoladi.

**Tavsiya:** avval bepul tarifda sinab ko'ring. Do'kon haqiqatan ishlay
boshlaganda pullik tarifga o'ting:

| Tarif | Narx | Nima beradi |
|---|---|---|
| `free` | $0 | Sinov uchun. Uxlaydi, rasm yo'qoladi |
| `0.5c-512mb` | **$7/oy** | Doim yoqiq, uxlamaydi |
| + Disk (1 GB) | +$0.25/oy | Rasmlar yo'qolmaydi (faqat pullik tarifda mumkin) |

> Manba: render.com/pricing va render.com/docs/free — 2026-yil sentabr holati.

---

### 1-qadam. Render'da hisob ochish

1. https://render.com saytiga kiring
2. **Get Started** → **GitHub** bilan ro'yxatdan o'ting
3. GitHub ruxsat so'raydi → **Authorize Render** bosing

---

### 2-qadam. Yangi Web Service yaratish

1. Render panelida yuqoridagi **New +** tugmasi → **Web Service**
2. `jtoxtasinov0-sys/k-beauty` repozitoriysini toping
   - Ko'rinmasa: **Configure account** → repozitoriyga ruxsat bering
3. Yonidagi **Connect** tugmasini bosing

---

### 3-qadam. Sozlamalarni to'ldirish

Formani **aynan shunday** to'ldiring:

| Maydon | Qiymat |
|---|---|
| **Name** | `kbeauty-backend` |
| **Language** | `Node` |
| **Branch** | `main` |
| **Region** | `Singapore` (Koreyaga eng yaqini) |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` (yoki `0.5c-512mb` — $7/oy) |

> ⚠️ **Root Directory** ni `backend` deb yozishni unutmang!
> Aks holda Render loyihani topa olmaydi va build xato beradi.

---

### 4-qadam. Maxfiy o'zgaruvchilar (Environment Variables)

Shu sahifada pastroqda **Environment Variables** bo'limi bor.
**Add Environment Variable** tugmasi orqali quyidagi **8 ta** qatorni qo'shing.

Qiymatlarni kompyuteringizdagi `backend/.env` faylidan ko'chiring
(uni Notepad bilan oching). **Qo'shtirnoqlarni ko'chirmang!**

| Key (nomi) | Value (qiymati) |
|---|---|
| `DATABASE_URL` | `.env` dan ko'chiring (`postgresql://` bilan boshlanadi) |
| `BOT_TOKEN` | `.env` dan ko'chiring |
| `BOT_USERNAME` | `K_Beauty_Store_Optom_bot` |
| `ADMIN_PASSWORD` | **YANGI kuchli parol o'ylab toping** (pastdagi izohni o'qing) |
| `ALLOW_INSECURE_AUTH` | `false` |
| `NODE_VERSION` | `22` |
| `WEBAPP_URL` | `https://kbeauty-miniapp.vercel.app` |
| `API_BASE_URL` | `https://kbeauty-backend.onrender.com` |

> 🔐 **ADMIN_PASSWORD haqida muhim ogohlantirish:**
> Kodda zaxira parol `kbeauty2025` turibdi va u GitHub'da hammaga ko'rinadi.
> Shuning uchun Render'da **boshqa, kuchli** parol qo'ying — masalan 16 ta
> tasodifiy belgi. Shunda eski parol ishlamay qoladi.

> ℹ️ `PORT` ni qo'shmang — Render uni o'zi beradi, kod uni avtomatik oladi.

---

### 5-qadam. Ishga tushirish

1. Pastdagi **Create Web Service** tugmasini bosing
2. Build boshlanadi — **3-5 daqiqa** kutasiz
3. Loglarda quyidagi uchta qator chiqishi kerak:

```
🗄️  PostgreSQL (Neon) bazasiga ulandi
🚀 API tayyor: http://localhost:10000
🤖 Bot ishga tushdi: @K_Beauty_Store_Optom_bot
```

4. Yuqorida yashil **Live** yozuvi va havola paydo bo'ladi.
   **Shu havolani ko'chirib oling** — masalan `https://kbeauty-backend.onrender.com`

> Agar havola boshqacha chiqsa (masalan `kbeauty-backend-a1b2.onrender.com`),
> 4-qadamdagi `API_BASE_URL` ni ham o'shanga to'g'rilang:
> **Environment** → `API_BASE_URL` → **Edit** → **Save**.

---

### 6-qadam. Backend ishlayotganini tekshirish

Havolani brauzerda oching. Shunday javob chiqsa — hammasi joyida:

```json
{ "name": "K-Beauty Store Optom API", "status": "ishlayapti" }
```

> ⚠️ **Juda muhim:** Render ishga tushgandan keyin kompyuteringizdagi
> backend'ni **to'xtating** (terminalda `Ctrl+C`). Telegram boti bir vaqtda
> ikki joyda ishlay olmaydi — aks holda loglarda `409` xatosi chiqadi va
> bot beqaror ishlaydi.

---

## 3-QISM — Vercel'ni backendga ulash

Endi frontendlarga backend manzilini aytish kerak.
Quyidagi qadamlar **ikkala loyiha uchun** takrorlanadi.

### Mini App uchun

1. https://vercel.com/dashboard ga kiring
2. **kbeauty-miniapp** loyihasini oching
3. Yuqoridan **Settings** → chapdan **Environment Variables**
4. Quyidagini qo'shing:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://kbeauty-backend.onrender.com`
     *(5-qadamdagi havolangiz — oxirida `/` belgisi BO'LMASIN!)*
   - **Environments:** uchalasi ham belgilansin (Production, Preview, Development)
5. **Save** bosing
6. Yuqoridan **Deployments** → eng yuqoridagi qatorning o'ng chetidagi **···** →
   **Redeploy** → tasdiqlash uchun yana **Redeploy**

### Admin panel uchun

Xuddi shu 6 qadamni **kbeauty-admin** loyihasida ham takrorlang.

> Nima uchun Redeploy kerak? Chunki `VITE_` bilan boshlanadigan o'zgaruvchilar
> sayt qurilayotgan paytda kod ichiga yoziladi. Qayta qurmasa — eski holat qoladi.

---

## 4-QISM — Telegram botni Mini App'ga ulash

1. Telegram'da **@BotFather** ni oching
2. `/mybots` → `K_Beauty_Store_Optom_bot` ni tanlang
3. **Bot Settings** → **Menu Button** → **Configure Menu Button**
4. Havolani yuboring: `https://kbeauty-miniapp.vercel.app`
5. Tugma nomini yuboring: `🛍 Do'kon`

Endi botda pastda "🛍 Do'kon" tugmasi paydo bo'ladi va bosilganda Mini App ochiladi.

---

## 5-QISM — Yakuniy tekshirish

Ketma-ket tekshirib chiqing:

- [ ] `https://kbeauty-backend.onrender.com` → JSON javob beradi
- [ ] `https://kbeauty-admin.vercel.app` → parol so'raydi, yangi parol bilan kiradi
- [ ] Admin panelda 16 ta mahsulot va ularning rasmlari ko'rinadi
- [ ] Telegram'da botga `/start` → javob beradi
- [ ] "🛍 Do'kon" tugmasi → Mini App ochiladi, mahsulotlar chiqadi
- [ ] Savatga qo'shib, test buyurtma berib ko'ring
- [ ] Buyurtma admin panelda "Buyurtmalar" bo'limida paydo bo'ladi
- [ ] Testdan keyin o'sha test buyurtmani o'chirib tashlang

---

## Keyinchalik kodni o'zgartirsangiz

```
git add -A
git commit -m "nima o'zgardi"
git push
```

- **Render** — `push` dan keyin o'zi qayta yuklaydi (avtomatik)
- **Vercel** — hozircha avtomatik emas. Ikki yo'l bor:
  - **a)** Har safar `miniapp/` va `admin/` papkalari ichida
    `vercel deploy --prod` buyrug'ini ishlatish
  - **b) Tavsiya etiladi:** Vercel'da loyihani GitHub'ga ulash
    (Settings → Git → Connect Git Repository). Shunda `push` qilganda
    Vercel ham avtomatik yangilanadi.
    **Muhim:** ulaganda **Root Directory** ni `miniapp` (yoki `admin`) qilib belgilang.

---

## Muammolar va yechimlari

| Muammo | Sabab | Yechim |
|---|---|---|
| Mini App bo'sh / "Server bilan aloqa yo'q" | `VITE_API_URL` qo'yilmagan yoki Redeploy qilinmagan | 3-QISM ni qaytadan bajaring |
| Render logida `409` | Bot ikki joyda ishlayapti | Kompyuterdagi backend'ni `Ctrl+C` bilan to'xtating |
| Render logida `401` | `BOT_TOKEN` noto'g'ri ko'chirilgan | Qiymatni qayta ko'chiring, qo'shtirnoqsiz |
| "Bazaga ulanib bo'lmadi" | `DATABASE_URL` noto'g'ri | Neon panelidan yangi connection string oling |
| Bot ~1 daqiqa kechikib javob beradi | Bepul tarif uxlab qolgan | Normal holat. $7/oy tarifga o'ting |
| Yangi yuklagan rasm yo'qoldi | Bepul tarifda fayllar saqlanmaydi | $7/oy tarif + Disk qo'shing |
| Admin panelga kira olmayapman | `ADMIN_PASSWORD` boshqa | Render → Environment → qiymatni tekshiring |
| Build xatosi: "package.json not found" | Root Directory noto'g'ri | Settings → Root Directory = `backend` |

---

## Eslab qolish uchun havolalar

| Nima | Qayerda |
|---|---|
| Kod | https://github.com/jtoxtasinov0-sys/k-beauty |
| Mini App | https://kbeauty-miniapp.vercel.app |
| Admin panel | https://kbeauty-admin.vercel.app |
| Vercel paneli | https://vercel.com/dashboard |
| Render paneli | https://dashboard.render.com |
| Neon (baza) | https://console.neon.tech |
| BotFather | https://t.me/BotFather |
