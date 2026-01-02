# 🚀 Deploy via Git to Cloudflare Pages

## ✅ Setup Complete!

Git repository initialized and ready for deployment.

---

## 📋 Step-by-Step Instructions

### Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `uniscrapper-frontend` (or any name you prefer)
3. **DO NOT** initialize with README, .gitignore, or license
4. Click **"Create repository"**
5. Copy the repository URL (e.g., `https://github.com/yourusername/uniscrapper-frontend.git`)

### Step 2: Add Files and Push to GitHub

Run these commands in your terminal:

```bash
cd D:\RTsolution

# Add all files (except those in .gitignore)
git add .

# Commit files
git commit -m "Initial commit: University data engine with Excel import/export"

# Add your GitHub repository (replace with your actual URL)
git remote add origin https://github.com/yourusername/uniscrapper-frontend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Connect to Cloudflare Pages

1. Go to: **https://dash.cloudflare.com/**
2. Navigate: **Workers & Pages** → **Pages**
3. Click: **"Create a project"**
4. Click: **"Connect to Git"** (NOT "Upload assets")
5. Authorize Cloudflare to access your GitHub account
6. Select your repository: `uniscrapper-frontend`
7. Click **"Begin setup"**

### Step 4: Configure Build Settings

**Framework preset:** Vite

**Build configuration:**
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (leave as default)

**Environment variables (optional):**
- `VITE_API_URL` = `https://university-data-api.rtsolutiontesting.workers.dev`

Click **"Save and Deploy"**

### Step 5: Done! 🎉

Your app will build and deploy automatically. After deployment (2-3 minutes), your URL will be:
```
https://uniscrapper-frontend.pages.dev
```

---

## 🔄 Future Updates

From now on, whenever you make changes:

```bash
# Make your changes
# Then commit and push:

git add .
git commit -m "Your change description"
git push
```

**Cloudflare Pages will automatically:**
1. Detect the push
2. Build your app
3. Deploy the new version
4. Update the live site

---

## 📍 Your URLs

**Frontend (after Git deployment):**
```
https://uniscrapper-frontend.pages.dev
```

**Backend API (already live):**
```
https://university-data-api.rtsolutiontesting.workers.dev
```

---

## ✅ Benefits of Git Deployment

- ✅ Automatic deployments on every push
- ✅ Build history and rollback options
- ✅ Preview deployments for pull requests
- ✅ Easy collaboration
- ✅ Version control

---

**Ready to deploy via Git! Follow the steps above.** 🚀


