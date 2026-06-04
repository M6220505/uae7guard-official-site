# Deployment Commands

## Option A: Vercel Dashboard

1. Push repository to GitHub.
2. Import project in Vercel.
3. Set environment variables from `.env.example`.
4. Deploy.

## Option B: One-click Button

Use the button in `README.md` after replacing your GitHub username.

## Option C: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

## Custom Domain

1. Add domain in Vercel project settings.
2. Add DNS records requested by Vercel.
3. Wait for SSL issuance and propagation.
