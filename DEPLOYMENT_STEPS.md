# 📝 Deployment Steps - Detailed Guide

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18+ installed
- [ ] Firebase account (free tier is fine)
- [ ] Cloudflare account (free tier is fine) - optional if using Firebase Hosting
- [ ] Git installed (for version control)
- [ ] Code editor (VS Code recommended)

## Phase 1: Firebase Setup

### Step 1.1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Enter project name (e.g., "university-data-engine")
4. Follow the wizard:
   - Disable Google Analytics (optional)
   - Click "Create project"
5. Wait for project creation
6. Click "Continue"

### Step 1.2: Get Firebase Config

1. In Firebase Console, click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register app:
   - App nickname: "University Data Engine"
   - Check "Also set up Firebase Hosting"
   - Click "Register app"
5. Copy the `firebaseConfig` object
6. **Share this config with me** so I can update your files

### Step 1.3: Enable Firebase Services

1. **Firestore Database**:
   - In Firebase Console, go to "Firestore Database"
   - Click "Create database"
   - Start in "production mode" (we'll add rules)
   - Choose location (closest to your users)
   - Click "Enable"

2. **Firebase Functions**:
   - In Firebase Console, go to "Functions"
   - Click "Get started"
   - Enable billing (required for Functions, but free tier has generous limits)
   - Wait for setup to complete

3. **Firebase Hosting** (if not using Cloudflare Pages):
   - Already enabled in Step 1.2
   - If not, go to "Hosting" → "Get started"

### Step 1.4: Get Service Account Key (For Backend)

1. In Firebase Console, go to Project Settings ⚙️
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Click "Generate key"
5. Save the JSON file securely
6. **IMPORTANT**: Never commit this file to Git!
7. **Share the file path with me** (or I'll help you set it up)

## Phase 2: Install Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version

# Login to Firebase
firebase login

# List your projects (verify login)
firebase projects:list
```

## Phase 3: Initialize Firebase in Your Project

```bash
# Make sure you're in the project root directory
cd D:\RTsolution

# Initialize Firebase
firebase init
```

**Select the following options:**
1. **Firestore**: Yes → Create new rules → Use existing index file
2. **Functions**: Yes → Use existing directory (backend) → JavaScript/TypeScript → TypeScript → Install dependencies → Yes
3. **Hosting**: Yes (if using Firebase Hosting) OR No (if using Cloudflare Pages)

**Important**: When asked for Functions directory, type: `backend`

## Phase 4: Configure Environment Variables

### Backend Environment

Create `backend/.env` file:

```bash
# Copy the example file (I'll create this)
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with your values (I'll help you fill this once you provide the info).

### Frontend Environment

Create `.env.local` file in root:

```bash
# I'll create this with your Firebase config
```

## Phase 5: Update Code (I'll Do This)

Once you provide:
1. Firebase config
2. Service account key path
3. Gemini API key (optional)

I'll update:
- `firebase.ts` - Frontend Firebase config
- `backend/.env` - Backend environment variables
- `backend/functions/index.ts` - Firebase Functions setup
- All configuration files

## Phase 6: Build and Deploy

### Step 6.1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 6.2: Build Backend

```bash
cd backend
npm run build
cd ..
```

### Step 6.3: Deploy Backend (Firebase Functions)

```bash
# Deploy functions
firebase deploy --only functions

# Note the function URL that's displayed (e.g., https://us-central1-your-project.cloudfunctions.net/api)
```

### Step 6.4: Deploy Frontend

#### Option A: Firebase Hosting

```bash
# Build frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

#### Option B: Cloudflare Pages

1. Go to https://dash.cloudflare.com
2. Go to "Pages" → "Create a project"
3. Connect your Git repository (GitHub/GitLab)
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`
5. Environment variables:
   - Add `VITE_API_URL` = your Firebase Functions URL
6. Click "Save and Deploy"

## Phase 7: Configure Firestore Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

## Phase 8: Test Deployment

1. **Test Backend API**:
   ```bash
   curl https://YOUR-FUNCTION-URL/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **Test Frontend**:
   - Open your deployed frontend URL
   - Check browser console for errors
   - Try creating a test job

3. **Test Firestore**:
   - Go to Firebase Console → Firestore
   - Verify collections are created
   - Check that data can be written/read

## Phase 9: Set Up Custom Domain (Optional)

### Firebase Hosting
1. Firebase Console → Hosting → "Add custom domain"
2. Follow instructions to verify domain
3. Update DNS records as instructed

### Cloudflare Pages
1. Cloudflare Dashboard → Pages → Your project → Custom domains
2. Add custom domain
3. Cloudflare will auto-configure DNS

## Troubleshooting

### Common Issues

1. **Functions deployment fails**:
   - Check Node.js version (need 18+)
   - Verify `backend/package.json` has correct dependencies
   - Check build output for errors

2. **Frontend can't connect to backend**:
   - Verify `VITE_API_URL` in `.env.local`
   - Check CORS settings in Firebase Functions
   - Verify function URL is correct

3. **Firestore permission errors**:
   - Check Firestore security rules
   - Verify rules are deployed
   - Check that authentication is working (if using)

4. **Build errors**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version
   - Verify TypeScript compilation

## Next Steps After Deployment

1. ✅ Set up monitoring (Firebase Console → Functions → Monitoring)
2. ✅ Set up alerts for errors
3. ✅ Test with a real university URL
4. ✅ Review logs for any issues
5. ✅ Update documentation with your URLs

---

**Need help? Share the information from QUICK_START.md and I'll guide you through each step!** 🚀


