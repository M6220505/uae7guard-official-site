# UAE7Guard Production Setup Checklist | قائمة التحقق من إعدادات الإنتاج

## English
1. **Get Alchemy API Key:** Go to [alchemy.com](https://www.alchemy.com/), create an app, and copy the API Key for `NEXT_PUBLIC_ALCHEMY_ID`.
2. **Get WalletConnect ID:** Go to [cloud.walletconnect.com](https://cloud.walletconnect.com/), create a project, and copy the Project ID for `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`.
3. **Setup Telegram Bot:** Message @BotFather on Telegram to create a bot and get the `TELEGRAM_BOT_TOKEN`.
4. **Deploy to Vercel:** 
   - Connect your GitHub repo.
   - Add all variables from `.env.example` to the Vercel 'Environment Variables' settings.
   - Click 'Deploy'.

## العربية
1. **الحصول على مفتاح Alchemy:** اذهب إلى [alchemy.com](https://www.alchemy.com/)، أنشئ تطبيقاً، وانسخ المفتاح لـ `NEXT_PUBLIC_ALCHEMY_ID`.
2. **الحصول على معرف WalletConnect:** اذهب إلى [cloud.walletconnect.com](https://cloud.walletconnect.com/)، أنشئ مشروعاً، وانسخ معرف المشروع لـ `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`.
3. **إعداد بوت تلغرام:** تواصل مع @BotFather على تلغرام لإنشاء بوت والحصول على `TELEGRAM_BOT_TOKEN`.
4. **النشر على Vercel:**
   - اربط مستودع GitHub الخاص بك.
   - أضف جميع المتغيرات من `.env.example` في إعدادات Vercel.
   - اضغط على 'Deploy'.
