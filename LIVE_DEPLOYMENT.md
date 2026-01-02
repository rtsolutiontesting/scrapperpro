# 🚀 Live Deployment - Let's Do This!

You're already logged into Firebase! Let's make it live.

## Current Status

✅ Firebase CLI installed and logged in
✅ You have 11 Firebase projects available
✅ Node.js ready (v22.17.1)
✅ All code prepared

## Quick Decision: Which Project?

**Option 1: Use Existing Project**
- Pick one from your list (e.g., `iapply-3`, `sample-firebase-ai-app-310dd`)
- Or tell me which one you want to use

**Option 2: Create New Project**
- I'll guide you to create a new one
- Recommended name: `university-data-engine`

---

## What I Need (5 minutes)

### 1. Project Choice
Tell me which project ID you want to use, or say "create new"

### 2. Get Firebase Web Config

**Quick steps:**
1. Go to: https://console.firebase.google.com
2. Select your project
3. Gear icon ⚙️ → "Project settings"
4. Scroll to "Your apps"
5. Click web icon `</>`
6. If no app, click "Add app" → Web
7. Check "Also set up Firebase Hosting"
8. Copy the `firebaseConfig` object

**Or run:** `node scripts/get-firebase-config.js` for detailed instructions

### 3. Get Service Account Key

1. Same Firebase Console → Project Settings ⚙️
2. "Service accounts" tab
3. "Generate new private key"
4. Save the JSON file (e.g., `C:\Users\YourName\Downloads\your-project-key.json`)
5. Tell me the file path

---

## Once You Provide These:

1. ✅ Project ID (or "create new")
2. ✅ Firebase Web Config (the JavaScript object)
3. ✅ Service Account Key file path

**I'll immediately:**
- Configure all files
- Set up Firebase Functions
- Prepare deployment
- Guide you through `firebase init` and deploy

---

## Then We Deploy! (10 minutes)

```bash
# Initialize Firebase
firebase init
# (I'll guide you on what to select)

# Install dependencies
npm install
cd backend && npm install && cd ..

# Deploy rules
firebase deploy --only firestore:rules

# Deploy backend
firebase deploy --only functions

# Build & deploy frontend
npm run build
firebase deploy --only hosting
```

**Done! Your system will be live!** 🎉

---

## Quick Start

**Just tell me:**
1. Which project ID to use (or "create new")
2. Your Firebase Web Config (paste it here)
3. Service Account Key file path

**And we'll make it live!** 🚀

