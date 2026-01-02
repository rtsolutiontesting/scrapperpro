# 🔧 Setup for Live Usage - Step by Step

## Current Status Check

✅ Firebase project selected: `uniscrapper-pro`  
✅ All configuration files ready  
❌ Dependencies NOT installed  
❌ Firebase not initialized  

## Let's Set It Up! 🚀

### Step 1: Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

### Step 2: Initialize Firebase

```bash
firebase init
```

**Select:**
- ✅ Firestore (use existing rules: `firestore.rules`)
- ✅ Functions (use existing directory: `backend`)
- ✅ Hosting (use existing directory: `dist`)

**When prompted:**
- Use TypeScript: **Yes**
- Install dependencies: **Yes**
- ESLint: **No** (or Yes if you want)
- Build script: **npm run build**

### Step 3: Verify Services Enabled

**Firestore:**
- Go to: https://console.firebase.google.com/project/uniscrapper-pro/firestore
- If not created, click "Create database"
- Choose production mode
- Select location (e.g., `us-central`)

**Functions:**
- Go to: https://console.firebase.google.com/project/uniscrapper-pro/functions
- If not enabled, click "Get started"
- Enable billing (required, but free tier is generous)

### Step 4: Deploy!

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules,firestore:indexes

# Build backend
cd backend
npm run build
cd ..

# Deploy Functions
firebase deploy --only functions

# Build frontend
npm run build

# Deploy frontend
firebase deploy --only hosting
```

---

## Quick Setup Script

I'll create a script to automate this! Let me run the installation now.

