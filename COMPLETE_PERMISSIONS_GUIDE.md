# Complete Guide: Fix 403 Permission Error

## 🎯 Goal
Allow public access to your Firebase Function so it can be called without authentication.

---

## ✅ METHOD 1: Firebase Console (Recommended - Easiest)

### Step 1: Open Firebase Functions
1. Go to: **https://console.firebase.google.com/project/uniscrapper-pro/functions**
2. You should see a list of functions
3. Look for a function named **"api"**
4. **Click on "api"**

### Step 2: Find Permissions
Once you're on the "api" function page, look for one of these:

**Option A:** Look for a button/link that says:
- "Manage Permissions"
- "Permissions"
- "Access Control"
- "Security"

**Option B:** Scroll down the page and look for sections like:
- "Permissions" section
- "Security" section
- "Invocation" settings

**Option C:** Check the top navigation - sometimes there are tabs like:
- Overview | Logs | Permissions | Settings

### Step 3: Add Public Access
When you find the permissions/security section:
1. Look for "Allow unauthenticated invocations" or "Public access"
2. Toggle it ON, or click "Allow unauthenticated"
3. Or click "Add principal" / "Add member"
4. Enter: `allUsers`
5. Select role: `Cloud Functions Invoker` or `Cloud Run Invoker`
6. Click "Save" or "Allow"

---

## ✅ METHOD 2: Google Cloud Console - Cloud Run

### Step 1: Open Cloud Run
1. Go to: **https://console.cloud.google.com/run?project=uniscrapper-pro**
2. Look for a service named **"api"**
3. **Click on "api"**

### Step 2: Find Permissions Tab
On the service details page, look at the TOP of the page for tabs:
- **OVERVIEW** | **METRICS** | **LOGS** | **REVISIONS** | **PERMISSIONS** | **YAML**

**Click on "PERMISSIONS"** tab

### Step 3: Add Principal
1. Click **"ADD PRINCIPAL"** button
2. In "New principals" field, type: `allUsers`
3. Select role: **"Cloud Run Invoker"**
4. Click **"SAVE"**

---

## ✅ METHOD 3: Command Line (Fastest if you have gcloud)

### Step 1: Check if gcloud is installed
Open PowerShell and type:
```powershell
gcloud --version
```

If it shows a version, continue. If not, skip to Method 4.

### Step 2: Run the command
```powershell
gcloud run services add-iam-policy-binding api --region=us-central1 --member="allUsers" --role="roles/run.invoker" --project=uniscrapper-pro
```

### Step 3: Test
After the command completes, test:
```
https://api-lxdtkbqefq-uc.a.run.app/health
```

---

## ✅ METHOD 4: Install gcloud CLI (If Method 3 didn't work)

### Step 1: Install gcloud
1. Go to: **https://cloud.google.com/sdk/docs/install**
2. Download Google Cloud SDK for Windows
3. Run the installer
4. Follow the installation wizard

### Step 2: Authenticate
Open PowerShell and run:
```powershell
gcloud auth login
```
This will open a browser window to sign in.

### Step 3: Set project
```powershell
gcloud config set project uniscrapper-pro
```

### Step 4: Run permission command
```powershell
gcloud run services add-iam-policy-binding api --region=us-central1 --member="allUsers" --role="roles/run.invoker"
```

---

## 🧪 After Fixing Permissions - Test It!

### Test URL:
```
https://api-lxdtkbqefq-uc.a.run.app/health
```

### Expected Result:
```json
{
  "status": "ok",
  "timestamp": "2026-01-02T..."
}
```

If you see this, **SUCCESS!** ✅

If you still see 403, wait 1-2 minutes for changes to propagate, then try again.

---

## 🆘 Still Having Trouble?

**Tell me:**
1. Which method did you try?
2. What page/URL are you currently on?
3. What do you see on the screen?
4. Any error messages?

Then I can give you specific guidance!

---

## 📝 Summary

**The goal:** Allow `allUsers` to invoke your `api` function

**The role:** `Cloud Run Invoker` or `Cloud Functions Invoker`

**Where to do it:** Function/Service level, NOT project level

**Fastest way:** Command line (Method 3) if you have gcloud installed

