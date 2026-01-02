# 🔄 Git Auto-Deploy Setup for Cloudflare Pages

## 🎯 Goal
Connect your GitHub repository to Cloudflare Pages for automatic deployments on every `git push`.

---

## 📋 Step-by-Step Instructions

### Step 1: Open Cloudflare Dashboard
1. Go to: **https://dash.cloudflare.com/**
2. Log in with your account (rtsolutiontesting@gmail.com)

### Step 2: Navigate to Pages
1. Click **"Workers & Pages"** in the left sidebar
2. Click **"Pages"** tab
3. You should see your project: **`uniscrapper-frontend`**

### Step 3: Connect to Git
1. Click on the **`uniscrapper-frontend`** project
2. Click the **"Settings"** tab (at the top)
3. Scroll down to **"Builds & deployments"** section
4. Click **"Connect to Git"** button

### Step 4: Authorize GitHub (if needed)
1. If prompted, click **"Authorize Cloudflare Pages"** or **"Install GitHub App"**
2. Select your GitHub account: **rtsolutiontesting**
3. Choose repository access:
   - **Option A (Recommended)**: Select only **`rtsolutiontesting/scrapperpro`**
   - **Option B**: Grant access to all repositories (less secure)
4. Click **"Install"** or **"Authorize"**

### Step 5: Select Repository
1. In the repository list, find and select: **`rtsolutiontesting/scrapperpro`**
2. Click **"Begin setup"**

### Step 6: Configure Build Settings
Fill in the following:

- **Project name**: `uniscrapper-frontend` (should be pre-filled)
- **Production branch**: `main`
- **Framework preset**: `Vite` (or leave as "None" and configure manually)
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty or enter `/`)
- **Environment variables** (click "Add variable" for each):
  - Name: `VITE_API_URL`
  - Value: `https://university-data-api.rtsolutiontesting.workers.dev`
  - Environment: Select all (Production, Preview, Branch previews)

### Step 7: Save and Deploy
1. Click **"Save and Deploy"**
2. Cloudflare will immediately start the first build
3. Wait for the build to complete (usually 2-3 minutes)

---

## ✅ After Setup

### Your URLs:
- **Production**: https://uniscrapper-frontend.pages.dev
- **Preview deployments**: Each commit gets a unique preview URL

### Automatic Deployments:
- ✅ Every push to `main` branch → Production deployment
- ✅ Pull requests → Preview deployment
- ✅ Other branches → Preview deployment

---

## 🧪 Test It!

After setup, try making a small change:

```bash
# Make a small change
echo "<!-- Updated -->" >> index.html

# Commit and push
git add .
git commit -m "Test auto-deploy"
git push origin main
```

Then check Cloudflare Pages dashboard - you should see a new deployment starting automatically!

---

## 🔍 Verify Connection

To verify Git is connected:
1. Go to Cloudflare Dashboard → Pages → `uniscrapper-frontend`
2. Check the **"Settings"** tab
3. Under **"Builds & deployments"**, you should see:
   - ✅ Git repository: `rtsolutiontesting/scrapperpro`
   - ✅ Branch: `main`
   - ✅ Connected status

---

## 🛠️ Troubleshooting

### If "Connect to Git" button is missing:
- Make sure you're on the **Settings** tab
- Scroll down to **"Builds & deployments"** section

### If repository not showing:
- Make sure GitHub authorization is complete
- Try refreshing the page
- Check that repository `rtsolutiontesting/scrapperpro` exists and you have access

### If build fails:
- Check build logs in Cloudflare Dashboard
- Verify `package.json` has a `build` script
- Verify `dist` folder is created after build

---

**Ready? Follow the steps above to set up auto-deploy! 🚀**


