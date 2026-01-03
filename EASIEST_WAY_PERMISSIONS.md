# EASIEST Way to Fix Permissions

## ✅ Method 1: Firebase Console (Recommended)

1. **Go to this URL:**
   ```
   https://console.firebase.google.com/project/uniscrapper-pro/functions
   ```

2. **Click on the function named "api"**

3. **On the function details page, look for:**
   - A section about "Public access" or "Permissions"
   - A toggle/button that says "Allow unauthenticated invocations"
   - Or look for "Security" or "IAM" settings

---

## ✅ Method 2: Cloud Run Console - Alternative Locations

If you're on the Cloud Run page for "api", the Permissions tab might be:

### Location A: Top Navigation
- Look at the very top of the page
- You should see tabs like: **OVERVIEW | METRICS | LOGS | REVISIONS | PERMISSIONS | YAML**
- Click **PERMISSIONS**

### Location B: Settings Menu
- Look for a **gear icon (⚙️)** or **settings** button
- Or look for **"Manage"** dropdown menu
- Click it and look for "Permissions" or "Access Control"

### Location C: Right Side Panel
- Sometimes there's a panel on the right side
- Look for **"ACCESS CONTROL"** or **"IAM"** section

---

## ✅ Method 3: Use gcloud CLI (If you have it installed)

Open PowerShell or Command Prompt and run:

```powershell
gcloud run services add-iam-policy-binding api --region=us-central1 --member="allUsers" --role="roles/run.invoker" --project=uniscrapper-pro
```

---

## 🆘 If You Still Can't Find It:

**Tell me:**
1. What's the exact URL in your browser?
2. What tabs/buttons do you see at the top of the page?
3. Are you on the Firebase Console or Google Cloud Console?

Then I can give you exact instructions!

---

**For now, try Method 1 (Firebase Console) - it's usually the easiest!**

