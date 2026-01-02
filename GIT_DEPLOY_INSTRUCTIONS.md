# 🚀 Deploy via Git - Quick Guide

## ✅ Git Repository Initialized!

Your local Git repository is ready. Now follow these steps:

---

## 📋 Steps to Deploy

### Step 1: Create GitHub Repository

1. Go to: **https://github.com/new**
2. Repository name: `uniscrapper-frontend`
3. **Leave everything unchecked** (no README, no .gitignore, no license)
4. Click **"Create repository"**
5. **Copy the repository URL** (you'll need it in Step 2)

---

### Step 2: Push to GitHub

Run these commands (replace `YOUR_USERNAME` with your GitHub username):

```bash
cd D:\RTsolution

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/uniscrapper-frontend.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** If you don't have GitHub CLI or credentials set up, GitHub will prompt you to authenticate.

---

### Step 3: Connect to Cloudflare Pages

1. Go to: **https://dash.cloudflare.com/**
2. Click: **Workers & Pages** → **Pages**
3. Click: **"Create a project"**
4. Click: **"Connect to Git"** ⭐ (NOT "Upload assets")
5. Authorize Cloudflare to access your GitHub account
6. Select repository: `uniscrapper-frontend`
7. Click **"Begin setup"**

---

### Step 4: Configure Build Settings

**Framework preset:** `Vite` (or select it manually)

**Build settings:**
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (default)

**Environment variables (optional):**
- Name: `VITE_API_URL`
- Value: `https://university-data-api.rtsolutiontesting.workers.dev`

Click **"Save and Deploy"**

---

### Step 5: Wait for Deployment

Cloudflare will:
1. Clone your repository
2. Install dependencies (`npm install`)
3. Build your app (`npm run build`)
4. Deploy to: `https://uniscrapper-frontend.pages.dev`

**Takes about 2-3 minutes**

---

## ✅ Done!

Your app is now live and will auto-deploy on every Git push!

---

## 🔄 Making Future Changes

After the initial setup, just:

```bash
# Make your code changes
# Then:

git add .
git commit -m "Description of your changes"
git push
```

**Cloudflare Pages automatically deploys your changes!** 🚀

---

## 📍 Your URLs

**Frontend:** `https://uniscrapper-frontend.pages.dev`  
**Backend API:** `https://university-data-api.rtsolutiontesting.workers.dev`

---

**Ready! Follow the steps above to deploy via Git.** ✅


