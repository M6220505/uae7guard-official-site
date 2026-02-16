# Deployment Guide for UAE7Guard

This guide provides step-by-step instructions to deploy your UAE7Guard application to production.

## Prerequisites

Before deploying, ensure you have:
- A GitHub account
- A Vercel account (free tier available)
- Git installed on your machine
- All environment variables ready (see `.env.example`)

## Step 1: Create Environment Variables

Before deploying, copy your `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Get from https://cloud.walletconnect.com/
- `NEXT_PUBLIC_ALCHEMY_API_KEY`: Get from https://www.alchemy.com/
- Add any other required API keys

⚠️ **IMPORTANT**: Never commit `.env.local` to Git. It's already in `.gitignore`.

## Step 2: Commit Your Code

Stage and commit all changes:

```bash
# Check current status
git status

# Add all files
git add .

# Create a commit
git commit -m "Initial production-ready build

- Configured internationalization with next-intl
- Set up Web3 integration with RainbowKit and Wagmi
- Implemented multi-language support (EN/AR)
- Added risk analysis engine
- Production build verified

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Step 3: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

If you have GitHub CLI installed:

```bash
# Create a new private repository
gh repo create uae7guard-official-site --private --source=. --remote=origin --push

# Or create a public repository
gh repo create uae7guard-official-site --public --source=. --remote=origin --push
```

### Option B: Using Git Commands

1. Go to https://github.com/new and create a new repository named `uae7guard-official-site`
2. Choose public or private
3. Do NOT initialize with README, .gitignore, or license (you already have these)
4. After creating, run these commands:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/uae7guard-official-site.git

# Push to GitHub
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: One-Click Deploy (Fastest)

Click this button to deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2Fuae7guard-official-site&env=NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,NEXT_PUBLIC_ALCHEMY_API_KEY&envDescription=Required%20API%20keys%20for%20Web3%20functionality&envLink=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2Fuae7guard-official-site%2Fblob%2Fmain%2F.env.example)

**Update the URL** in the button above after creating your GitHub repository.

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name: `uae7guard-official-site`
- Directory: `./` (press Enter)
- Override settings? **N**

### Option C: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
4. Add Environment Variables (from your `.env.example`):
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_ALCHEMY_API_KEY`
   - Add any other required variables
5. Click **Deploy**

## Step 5: Verify Deployment

After deployment, Vercel will provide a URL (e.g., `https://uae7guard-official-site.vercel.app`).

Visit your site and verify:
- ✅ Homepage loads correctly
- ✅ Language switcher works (EN/AR)
- ✅ Web3 wallet connection works
- ✅ All pages are accessible
- ✅ API routes respond correctly

## Environment Variables for Production

Required environment variables (add these in Vercel dashboard):

```env
# WalletConnect Project ID (Required for Web3)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Alchemy API Key (Required for blockchain interactions)
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here

# Optional: Analytics, monitoring, etc.
# Add any additional variables your application needs
```

## Custom Domain (Optional)

To add a custom domain:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Domains**
3. Add your domain (e.g., `uae7guard.com`)
4. Follow Vercel's DNS configuration instructions
5. Wait for DNS propagation (usually 15 minutes to 24 hours)

## Continuous Deployment

Once connected to GitHub, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Run build checks before deploying

## Troubleshooting

### Build Fails on Vercel

1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Verify `package.json` scripts are correct
4. Test build locally: `npm run build`

### Environment Variables Not Working

1. Make sure variables start with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding new environment variables
3. Check variable names match exactly (case-sensitive)

### 404 Errors

1. Verify all pages are under `app/[locale]/` directory
2. Check middleware.ts is configured correctly
3. Review Vercel deployment logs

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub CLI](https://cli.github.com/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [Alchemy Dashboard](https://www.alchemy.com/)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Next.js documentation
3. Verify all environment variables are set correctly
4. Ensure your local build succeeds: `npm run build`

---

**Note**: This project is production-ready. The build has been verified and all dependencies are properly configured.
