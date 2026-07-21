# UAE7Guard Production Setup Checklist | قائمة التحقق من إعدادات الإنتاج

## English
1. **Get WalletConnect ID:** Go to [cloud.walletconnect.com](https://cloud.walletconnect.com/), create a project, and copy the Project ID for `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
2. **Optional - Get Alchemy API Key:** Go to [alchemy.com](https://www.alchemy.com/), create an app, and copy the API Key for `NEXT_PUBLIC_ALCHEMY_API_KEY`.
3. **Setup Telegram Bot:** Message @BotFather on Telegram to create a bot and get the `TELEGRAM_BOT_TOKEN`.
4. **Deploy without Vercel:** 
   - Use Render/Railway with `npm ci && npm run build` and `npm run start`, or use Docker/PM2 from `docs/non-vercel-deployment.md`.
   - Add all variables from `.env.example` to your host environment settings or `.env.production`.
   - Connect your domain and set `NEXT_PUBLIC_APP_URL` to the HTTPS URL.

## العربية
1. **الحصول على معرف WalletConnect:** اذهب إلى [cloud.walletconnect.com](https://cloud.walletconnect.com/)، أنشئ مشروعاً، وانسخ معرف المشروع لـ `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
2. **اختياري - الحصول على مفتاح Alchemy:** اذهب إلى [alchemy.com](https://www.alchemy.com/)، أنشئ تطبيقاً، وانسخ المفتاح لـ `NEXT_PUBLIC_ALCHEMY_API_KEY`.
3. **إعداد بوت تلغرام:** تواصل مع @BotFather على تلغرام لإنشاء بوت والحصول على `TELEGRAM_BOT_TOKEN`.
4. **النشر بدون Vercel:**
   - استخدم Render/Railway بأوامر `npm ci && npm run build` و `npm run start`، أو استخدم Docker/PM2 من `docs/non-vercel-deployment.md`.
   - أضف جميع المتغيرات من `.env.example` في إعدادات الاستضافة أو ملف `.env.production`.
   - اربط الدومين واضبط `NEXT_PUBLIC_APP_URL` على رابط HTTPS النهائي.
