# Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment

- [ ] Firebase project created
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Firebase login completed (`firebase login`)
- [ ] Cloudflare account created (if using Cloudflare)
- [ ] Domain verified (if using custom domain)
- [ ] Gemini API key obtained (optional)

## Firebase Setup

- [ ] Firebase project initialized (`firebase init`)
- [ ] Firestore database created
- [ ] Firestore collections created:
  - [ ] `fetch_jobs`
  - [ ] `university_programs`
  - [ ] `program_versions`
  - [ ] `audit_logs`
  - [ ] `diff_results`
- [ ] Firestore security rules configured
- [ ] Firebase Functions enabled
- [ ] Firebase Hosting enabled (if not using Cloudflare Pages)

## Backend Configuration

- [ ] Backend `.env` file created with:
  - [ ] `FIREBASE_PROJECT_ID`
  - [ ] `GEMINI_API_KEY` (if using AI verification)
  - [ ] Other environment variables
- [ ] Firebase Admin SDK service account key added
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Backend code compiled (`cd backend && npm run build`)

## Frontend Configuration

- [ ] Frontend `.env.local` file created with:
  - [ ] `VITE_API_URL` (backend API URL)
  - [ ] Firebase config (or loaded from Firebase)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend builds successfully (`npm run build`)

## Deployment

- [ ] Backend deployed:
  - [ ] Firebase Functions deployed (`firebase deploy --only functions`)
  - [ ] API endpoint tested
  - [ ] Health check working
- [ ] Frontend deployed:
  - [ ] Cloudflare Pages deployed (or Firebase Hosting)
  - [ ] Custom domain configured (if applicable)
  - [ ] Frontend loads correctly

## Testing

- [ ] Create test job via API
- [ ] Job executes successfully
- [ ] Data appears in Firestore
- [ ] Frontend displays jobs correctly
- [ ] Manual approval workflow works
- [ ] Error handling works correctly

## Post-Deployment

- [ ] Monitoring set up
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team trained on system usage


