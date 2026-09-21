# K-Beauty Store Optom — Internetga chiqarish qo'llanmasi

> ## ✅ HOLAT: TO'LIQ ISHGA TUSHIRILGAN (2026-09-22)
>
> | Nima | Havola | Holat |
> |---|---|---|
> | Mini App (mijozlar) | https://kbeauty-miniapp.vercel.app | ishlayapti |
> | Admin panel (siz) | https://kbeauty-admin-sepia.vercel.app | ishlayapti |
> | Backend + bot | https://k-beauty-0rv9.onrender.com | ishlayapti |
>
> Tekshirilgan: mijoz API himoyalangan (401), admin API himoyalangan (401),
> eski ochiq parol ishlamaydi (401), rasmlar ochiladi (200).
>
> **Quyidagi qadamlar tarix uchun qoldirilgan** — qayta qurish kerak bo'lsa yoki
> nimadir buzilsa, shu yo'riqnomadan foydalanasiz.

Loyiha uch qismdan iborat va ular **uch xil joyda** ishlaydi:

```
  MIJOZ (Telegram)                 SIZ (brauzer)
        |                                |
        v                                v
  kbeauty-miniapp.vercel.app    kbeauty-admin-sepia.vercel.app
  (Mini App — Vercel)             (Admin panel — Vercel)
         \                             /
          \                           /
           v                         v
         k-beauty-0rv9.onrender.com      
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
| Admin panel (siz ishlatasiz) | https://kbeauty-admin-sepia.vercel.app |

> 🚫 **Diqqat:** `kbeauty-admin.vercel.app` (`-sepia` siz) — **begona odamning sayti**.
> O'sha nom Vercel'da band ekan, shuning uchun bizga `-sepia` qo'shimchali nom berildi.
> Faqat yuqoridagi jadvaldagi havoladan foydalaning va uni brauzerga saqlab qo'ying.

---

### Avtomatik yangilanish — sozlab qo'yilgan ✅

Vercel ikkala loyihani GitHub'ga o'zi ulagan. Dastlab qaysi papkadan qurishni
bilmagani uchun `git push` da xato berardi — **bu tuzatildi**:

| Loyiha | Root Directory |
|---|---|
| `kbeauty-miniapp` | `miniapp` |
| `kbeauty-admin` | `admin` |

Endi `git push` qilganingizda ikkala sayt ham o'zi qayta quriladi.
Hech narsa qilishingiz shart emas.

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

Forma maydonlari **yuqoridan pastga** shu tartibda keladi:

| № | Maydon | Qiymat |
|---|---|---|
| 1 | **Name** | `kbeauty-backend` |
| 2 | **Region** | `Singapore` (Koreyaga eng yaqini) |
| 3 | **Branch** | `main` |
| 4 | **Language** | `Node` |
| 5 | **Build Command** | `npm install` |
| 6 | **Start Command** | `npm start` |
| 7 | **Instance Type** | `Free` (yoki `0.5c-512mb` — $7/oy) |

> 📌 **Name** ni yozganingizda, uning ostida havola ko'rinadi —
> `kbeauty-backend.onrender.com`. Agar bu nom band bo'lsa, Render boshqa nom
> so'raydi. **O'sha havolani yozib oling** — 3-QISM da kerak bo'ladi.

### ⚠️ Root Directory — **Advanced** bo'limida

Bu maydon asosiy formada emas. Pastdagi **Advanced** tugmasini bosib oching,
so'ng **Root Directory** maydoniga `backend` deb yozing.

Bu eng ko'p unutiladigan qadam — agar bo'sh qolsa, build
`Could not read package.json` xatosi bilan to'xtaydi.

Xuddi shu **Advanced** bo'limida **Health Check Path** maydoni ham bor —
unga `/` deb yozib qo'ying (majburiy emas, lekin foydali).

---

### 4-qadam. Maxfiy o'zgaruvchilar (Environment Variables)

Shu sahifada pastroqda **Environment Variables** bo'limi bor.
**Add Environment Variable** tugmasi orqali quyidagi **8 ta** qatorni qo'shing.

Qiymatlarni kompyuteringizdagi `backend/.env` faylidan ko'chiring
(uni Notepad bilan oching). **Qo'shtirnoqlarni ko'chirmang!**

| № | Key (nomi) | Value (qiymati) | Qayerdan |
|---|---|---|---|
| 1 | `DATABASE_URL` | `postgresql://neondb_owner:...` | **`.env` dan ko'chiring** |
| 2 | `BOT_TOKEN` | `1234567890:AAE...` ko'rinishida | **`.env` dan ko'chiring** |
| 3 | `BOT_USERNAME` | `K_Beauty_Store_Optom_bot` | **`.env` dan ko'chiring** |
| 4 | `WEBAPP_URL` | `https://kbeauty-miniapp.vercel.app` | ⚠️ yangi — `.env` dagisi eski! |
| 5 | `ADMIN_PASSWORD` | *o'zingiz o'ylab toping, 8+ belgi* | ⚠️ yangi — `.env` dagisi ochiq! |
| 6 | `ALLOW_INSECURE_AUTH` | `false` | ⚠️ yangi — `.env` da `true` turibdi! |
| 7 | `NODE_VERSION` | `22` | yangi |

**`.env` dan KO'CHIRILMAYDIGANLAR:**

| Kalit | Nega |
|---|---|
| `PORT` | Render uni o'zi beradi — qo'shsangiz ziyon qiladi |
| `API_BASE_URL` | Kodda umuman ishlatilmaydi — kerak emas |
| `WEBAPP_URL` | `.env` dagisi eski vaqtinchalik havola (`trycloudflare.com`) |
| `ADMIN_PASSWORD` | `.env` dagisi (`kbeauty2025`) GitHub'da ochiq turibdi |
| `ALLOW_INSECURE_AUTH` | `.env` da `true` — internetda bu **xavfli** |

> 🔐 **ADMIN_PASSWORD majburiy.** Koddagi ochiq zaxira parol (`kbeauty2025`)
> olib tashlandi — endi parol berilmasa server **umuman ishga tushmaydi** va
> logda `❌ ADMIN_PASSWORD berilmagan` deb yozadi. Kamida 8 ta belgi kerak.
> O'zingiz kuchli parol o'ylab toping (masalan 16 ta tasodifiy belgi).

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
   **Shu havolani ko'chirib oling** — 3-QISM da kerak bo'ladi.

> Render nomni band bo'lsa o'zgartiradi. Bizda aynan shunday bo'ldi:
> `kbeauty-backend` o'rniga **`k-beauty-0rv9.onrender.com`** berildi.
> Shuning uchun havolani taxmin qilmang — Render bergan aniq havolani oling.

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
   - **Value:** `https://k-beauty-0rv9.onrender.com`
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

## 4-QISM — Telegram menyu tugmasi (AVTOMATIK ✅)

**Bu qismni qo'lda bajarish shart emas.** Bot ishga tushganda menyu tugmasini
o'zi o'rnatadi — `WEBAPP_URL` ni (4-qadamda qo'ygan `https://kbeauty-miniapp.vercel.app`)
Telegram'ga o'zi yuboradi.

Render loglarida shu qatorni ko'rsangiz — hammasi joyida:

```
📱 Menu tugmasi o'rnatildi: https://kbeauty-miniapp.vercel.app
```

### Agar ogohlantirish chiqsa

Bunday qator chiqsa, `WEBAPP_URL` `https://` bilan boshlanmayapti:

```
⚠️  WEBAPP_URL https emas — Telegram menu tugmasi o'rnatilmadi
```

Render → **Environment** → `WEBAPP_URL` ni tekshiring. U aynan shunday bo'lsin:
`https://kbeauty-miniapp.vercel.app` (oxirida `/` yo'q, `http://` emas).
Tuzatgandan keyin **Manual Deploy** → **Deploy latest commit**.

### Qo'lda o'rnatish (faqat zarurat bo'lsa)

Agar baribir ishlamasa, BotFather orqali qo'lda o'rnatasiz:

1. Telegram'da **@BotFather** ni oching
2. `/mybots` → `K_Beauty_Store_Optom_bot` ni tanlang
3. **Bot Settings** → **Menu Button** → **Configure Menu Button**
4. Havolani yuboring: `https://kbeauty-miniapp.vercel.app`
5. Tugma nomini yuboring: `Do'kon`

> Eslatma: bot xabarlari ichidagi "🛍 Do'konni ochish" tugmasi ham xuddi shu
> `WEBAPP_URL` dan foydalanadi — u BotFather'ga bog'liq emas.

---

## 5-QISM — Yakuniy tekshirish

Ketma-ket tekshirib chiqing:

- [ ] `https://k-beauty-0rv9.onrender.com` → JSON javob beradi
- [ ] `https://kbeauty-admin-sepia.vercel.app` → parol so'raydi, yangi parol bilan kiradi
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
- **Vercel** — u ham `push` dan keyin o'zi yangilanadi (Root Directory sozlangan)

Ya'ni yuqoridagi uchta buyruqdan boshqa hech narsa kerak emas.
Zarur bo'lsa qo'lda ham yangilash mumkin: `miniapp/` va `admin/` papkalari
ichida navbat bilan `vercel deploy --prod`.

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
| Render build xatosi: "package.json not found" | Root Directory noto'g'ri | Render → Settings → Root Directory = `backend` |
| Vercel'da `Could not read package.json` | Root Directory o'chib ketgan | Vercel → Settings → Build & Deployment → Root Directory = `miniapp` / `admin` |
| Render logida `❌ ADMIN_PASSWORD berilmagan` | Parol qo'yilmagan | Render → Environment → `ADMIN_PASSWORD` qo'shing (8+ belgi) |
| Admin panelda begona sayt ochildi | `-sepia` siz havolaga kirilgan | To'g'ri havola: `kbeauty-admin-sepia.vercel.app` |

---

## Eslab qolish uchun havolalar

| Nima | Qayerda |
|---|---|
| Kod | https://github.com/jtoxtasinov0-sys/k-beauty |
| Mini App | https://kbeauty-miniapp.vercel.app |
| Admin panel | https://kbeauty-admin-sepia.vercel.app |
| Vercel paneli | https://vercel.com/dashboard |
| Render paneli | https://dashboard.render.com |
| Neon (baza) | https://console.neon.tech |
| BotFather | https://t.me/BotFather |
