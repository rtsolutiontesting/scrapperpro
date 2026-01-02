# 🔍 Troubleshooting 404 Error

## Issue
The API endpoint is returning 404: `https://us-central1-uniscrapper-pro.cloudfunctions.net/api/health`

## Possible Causes

### 1. Function Not Fully Deployed
- Functions can take 2-5 minutes to become active
- Check Firebase Console for deployment status

### 2. Build Issue During Deployment
- The error message mentioned `dist/functions/index.js does not exist`
- Firebase builds in the cloud, so local build might not match

### 3. Function Export Issue
- Verify the function is exported correctly as `api`
- Check that the Express app is properly exported

## Solutions

### Check Firebase Console
1. Go to: https://console.firebase.google.com/project/uniscrapper-pro/functions
2. Check if the `api` function exists
3. Check the "Logs" tab for errors
4. Check the "Trigger" tab for the correct URL

### Verify Function Code
The function should export as:
```typescript
export const api = onRequest({...}, app);
```

### Re-deploy if Needed
```bash
cd backend
npm run build
cd ..
firebase deploy --only functions
```

### Check Function Logs
```bash
firebase functions:log --only api
```

---

**Next Step**: Check Firebase Console to see the actual deployment status!


