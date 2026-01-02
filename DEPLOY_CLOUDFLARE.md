# 🚀 Deploy to Cloudflare Pages

## Quick Deploy via CLI

### Step 1: Install Wrangler (if not already installed)
```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare
```bash
wrangler login
```

### Step 3: Deploy to Cloudflare Pages
```bash
# Build the project first
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=uniscrapper-frontend
```

---

## Deploy via Cloudflare Dashboard

### Option 1: Direct Upload

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com/
   - Navigate to: **Workers & Pages** → **Pages**
   - Click: **Create a project** → **Upload assets**

3. **Upload the dist folder:**
   - Project name: `uniscrapper-frontend`
   - Upload the entire contents of the `dist` folder
   - Click **Deploy site**

### Option 2: Git Integration (Recommended for future updates)

1. **Push your code to GitHub/GitLab:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages:**
   - Go to: https://dash.cloudflare.com/ → **Workers & Pages** → **Pages**
   - Click: **Create a project** → **Connect to Git**
   - Select your repository
   - Build settings:
     - **Framework preset:** Vite
     - **Build command:** `npm run build`
     - **Build output directory:** `dist`
     - **Root directory:** `/` (or leave blank)

3. **Environment Variables (if needed):**
   - Add any environment variables in the dashboard
   - Currently, the API URL is hardcoded to: `https://university-data-api.rtsolutiontesting.workers.dev`

---

## After Deployment

Your app will be live at:
```
https://uniscrapper-frontend.pages.dev
```

Or if you set a custom domain:
```
https://your-custom-domain.com
```

---

## Current Configuration

- **API URL:** `https://university-data-api.rtsolutiontesting.workers.dev`
- **Build Output:** `dist/`
- **Build Command:** `npm run build`

---

## Troubleshooting

1. **Build fails:**
   - Run `npm install` to ensure all dependencies are installed
   - Check that `npm run build` works locally first

2. **API not working:**
   - Verify the Cloudflare Worker is deployed and accessible
   - Check the API URL in `services/api.ts`

3. **Static assets not loading:**
   - Ensure `dist` folder contains all built files
   - Check that paths are relative (not absolute)


