# Git Setup & Deployment Guide

## ⚠️ First: Configure Git (One-Time Setup)

Run these commands to set your Git identity:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Or set it only for this repository (replace with your info):

```bash
cd D:\RTsolution
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

---

## ✅ Then: Complete the Commit

After setting your Git identity, run:

```bash
cd D:\RTsolution
git commit -m "Initial commit: University data engine with Excel import/export"
```

---

## 🚀 Deploy to Cloudflare Pages via Git

### Step 1: Create GitHub Repository

1. Go to: **https://github.com/new**
2. Repository name: `uniscrapper-frontend`
3. **Leave everything unchecked**
4. Click **"Create repository"**
5. Copy the repository URL (e.g., `https://github.com/yourusername/uniscrapper-frontend.git`)

---

### Step 2: Push to GitHub

```bash
cd D:\RTsolution

# Add GitHub as remote (replace URL with yours)
git remote add origin https://github.com/yourusername/uniscrapper-frontend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** GitHub will ask you to authenticate (use Personal Access Token or GitHub CLI)

---

### Step 3: Connect to Cloudflare Pages

1. Go to: **https://dash.cloudflare.com/**
2. Click: **Workers & Pages** → **Pages**
3. Click: **"Create a project"**
4. Click: **"Connect to Git"** ⭐
5. Authorize Cloudflare → Select your GitHub account
6. Select repository: `uniscrapper-frontend`
7. Click **"Begin setup"**

---

### Step 4: Configure Build

**Framework:** Vite

**Build settings:**
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

**Environment variables (optional):**
- `VITE_API_URL` = `https://university-data-api.rtsolutiontesting.workers.dev`

Click **"Save and Deploy"**

---

### Step 5: Done! 🎉

Your app will deploy automatically in 2-3 minutes.

**Live URL:** `https://uniscrapper-frontend.pages.dev`

---

## 🔄 Future Updates

Just push to Git:

```bash
git add .
git commit -m "Your changes"
git push
```

**Cloudflare Pages auto-deploys!** 🚀

---

## 📍 URLs

**Frontend:** `https://uniscrapper-frontend.pages.dev`  
**Backend:** `https://university-data-api.rtsolutiontesting.workers.dev`


