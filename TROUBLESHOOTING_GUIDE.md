# 🔍 Troubleshooting Guide

## Current Issue

**Error**: `dist/functions/index.js does not exist` during cloud build  
**Status**: Cloud Build logs not accessible via direct link

## Diagnosis Steps

### 1. Check Firebase Functions Console
Go to: https://console.firebase.google.com/project/uniscrapper-pro/functions

Click on the `api` function and check:
- **Logs tab**: Look for build or runtime errors
- **Metrics tab**: See if function is receiving requests
- **Trigger tab**: Verify the exact URL

### 2. Check Cloud Build History
Go to: https://console.cloud.google.com/cloud-build/builds?project=uniscrapper-pro

Look for:
- Recent failed builds
- Build error messages
- Build logs for the failed build

### 3. Verify Local Build
Local build works, so the issue is environment-specific to cloud build.

### 4. Possible Causes

Since local build works but cloud build fails:

1. **TypeScript version mismatch**
2. **Missing dependencies in package.json**
3. **Path resolution differences**
4. **Node.js version differences**
5. **File permissions/issues**

## Next Steps

1. ✅ Check Firebase Functions logs (see link above)
2. ✅ Check Cloud Build history (see link above)
3. ✅ Share any errors you find from the logs

---

**The function code is correct - we need to see the actual build error from Firebase Console!**

