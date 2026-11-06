# ILMHUB.TREND

**Tagline:** *"Internet olamidagi eng mashhur saytlar va ilovalar bir joyda!"*

ILMHUB.TREND — dunyoning eng mashhur veb-saytlari, mobil ilovalari, raqamli platformalari va onlayn xizmatlari haqida statistikalar, reytinglar va foydalanuvchi sharhlarini jamlovchi zamonaviy tahliliy platforma.

## Asosiy imkoniyatlar

- **Bosh sahifa (Homepage):** Qidiruv tizimi (avtotoʻldirish bilan), platforma statistikasi kartalari, mashhur saytlar va mobil ilovalar vitrinasi.
- **Saytlar va Ilovalar katalogi:** Kategoriya, davlat, platforma (Android, iOS, Web, Desktop) va koʻrsatkichlar boʻyicha filtrlash hamda saralash.
- **Batafsil tahlil sahifalari:**
  - Saytlar uchun: Global reyting, oylik tashriflar, unikal tashrifchilar, oʻrtacha davomiylik, bounce rate, trafik manbalari (Recharts), davlatlar taqsimoti va tarixiy trafik grafigi.
  - Ilovalar uchun: Yuklab olishlar soni (Downloads) va oylik faol foydalanuvchilar (MAU) alohida koʻrsatilgan, reyting, versiya, Google Play va App Store havolalari.
- **Foydalanuvchi sharhlari:** 1–5 yulduzli baholash, sharh yozish, "Foydali" (like) bosish, shikoyat qilish (report) va saralash.
- **Reytinglar tizimi:** Top 100 saytlar, Top 100 ilovalar, eng tez oʻsayotgan saytlar, AI vositalar, taʼlim, ijtimoiy tarmoqlar va oʻyinlar.
- **Admin Panel:** Sayt va ilova qoʻshish, tavsif va statistikalarni tahrirlash, kategoriyalarni boshqarish, sharhlarni moderatsiya qilish va foydalanuvchi rollarini boshqarish.
- **Dark & Light tema:** Sukut boʻyicha qorongʻu (Dark) rejim va yorugʻ (Light) rejimga oʻtish imkoniyati.

## Oʻrnatish va ishga tushirish

1. Bogʻliqliklarni oʻrnating:
   ```bash
   npm install
   ```

2. `.env.example` faylidan `.env` yarating va kerakli oʻzgaruvchilarni kiriting:
   ```bash
   cp .env.example .env
   ```

3. Dasturni ishga tushiring:
   ```bash
   npm run dev
   ```

4. Ishlab chiqarish (Production) uchun yigʻish:
   ```bash
   npm run build
   npm start
   ```

## Maʼlumotlar va API integratsiyasi

Platforma `SIMILARWEB_API_KEY` va `SERPAPI_KEY` muhit oʻzgaruvchilari orqali tashqi tahliliy provayderlarga ulanish imkoniyatiga ega. API kalitlari kiritilmagan holatda barcha namuna koʻrsatkichlar **Demo data** sifatida aniq belgilanadi.
