# ✅ Use Firebase Console (No Installation Needed!)

Since gcloud CLI is not installed, let's use the Firebase Console instead - it's easier!

---

## 🎯 Step-by-Step: Fix Permissions via Firebase Console

### Step 1: Open Firebase Functions
1. **Open your web browser**
2. **Go to this URL:**
   ```
   https://console.firebase.google.com/project/uniscrapper-pro/functions
   ```
3. **Make sure you're logged in with your Google account**

### Step 2: Click on Your Function
1. You should see a list of functions
2. **Look for a function named "api"**
3. **Click on "api"** (the name or anywhere on that row)

### Step 3: Find Permissions/Security Settings
Once you're on the "api" function details page, look for:

**Option A - Top Tabs:**
- Look at the top of the page for tabs like:
  - **Overview | Logs | Permissions | Settings**
- **Click "Permissions" tab**

**Option B - Security Section:**
- Scroll down the page
- Look for a section called:
  - "Security" or
  - "Permissions" or
  - "Invocation permissions" or
  - "Access control"

**Option C - Button/Toggle:**
- Look for a button or toggle that says:
  - "Allow unauthenticated invocations"
  - "Make public"
  - "Public access"
  - "Manage permissions"

### Step 4: Enable Public Access
When you find the permissions/security section:

**If you see a toggle:**
- Turn ON "Allow unauthenticated invocations"

**If you see a button:**
- Click "Allow unauthenticated" or "Make public"

**If you see "Add principal" or "Add member":**
1. Click "Add principal" or "Add member"
2. Enter: `allUsers`
3. Select role: `Cloud Functions Invoker` or `Cloud Run Invoker`
4. Click "Save"

### Step 5: Wait and Test
1. **Wait 30-60 seconds** for changes to apply
2. **Test the endpoint:**
   ```
   https://api-lxdtkbqefq-uc.a.run.app/health
   ```
3. **You should see:**
   ```json
   {"status":"ok","timestamp":"..."}
   ```

---

## 🆘 Can't Find Permissions?

**If you can't find the permissions section, tell me:**
1. What page are you on? (What's the URL?)
2. What do you see on the "api" function page?
3. Are there any tabs or buttons visible?

Then I can give you more specific instructions!

---

## 📝 Summary

**URL to start:** https://console.firebase.google.com/project/uniscrapper-pro/functions

**What to do:** Click "api" → Find "Permissions" → Allow public access

**No installation needed!** Just use your browser.

