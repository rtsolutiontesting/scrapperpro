# Deployment Status & ETA

## ⏱️ ETA: 10-15 minutes (first deployment)

## ✅ Check Progress (No Cloud Build Access Needed!)

You don't need Cloud Build permissions! Check deployment via Firebase:

### Option 1: Firebase Functions Dashboard
**https://console.firebase.google.com/project/uniscrapper-pro/functions**

This shows:
- Function deployment status
- Active functions
- Logs
- URLs

### Option 2: Terminal Output
If you ran `firebase deploy --only functions`, the terminal will show:
- ✅ "Deploy complete!" when done
- ❌ Error messages if something fails
- Progress updates during deployment

### Option 3: Check if Functions are Live
After ~10-15 minutes, test the health endpoint:
```
https://us-central1-uniscrapper-pro.cloudfunctions.net/api/health
```

If it returns `{"status":"ok"}`, deployment succeeded!

---

## 🔒 About Cloud Build Permissions (Optional)

The Cloud Build console requires extra permissions (`cloudbuild.builds.viewer` role). 

**You don't need this for deployment!** Firebase CLI handles everything.

If you want Cloud Build access (optional):
1. Click "Request permissions" in Cloud Build console
2. Or ask project owner to grant `Cloud Build Viewer` role

**But this is NOT required for deployment to work!**

