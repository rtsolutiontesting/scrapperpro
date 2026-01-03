# ❌ PROBLEM & ✅ SOLUTION

## ❌ The Problem:

You're on the **PROJECT-LEVEL** IAM page:
- URL: `console.cloud.google.com/iam-admin/iam?project=uniscrapper-pro`
- This page CANNOT add `allUsers` to projects
- Error: "allUsers cannot be added to this resource"

## ✅ The Solution:

You need to go to the **SERVICE-LEVEL** (Cloud Run) permissions page instead!

---

## 🔗 CORRECT URL (Copy This):

```
https://console.cloud.google.com/run/detail/us-central1/api?project=uniscrapper-pro
```

**OR navigate manually:**
1. Go to: https://console.cloud.google.com/run?project=uniscrapper-pro
2. Click on the service named "api"
3. Go to "PERMISSIONS" tab

---

## 📋 STEP-BY-STEP:

### Step 1: Close This Dialog
- Click "Cancel" on the current dialog
- You're on the wrong page (project IAM)

### Step 2: Go to Cloud Run
- Copy the URL above, OR
- In Google Cloud Console, search for "Cloud Run" in the top search bar
- Click "Cloud Run" service

### Step 3: Find Your Function
- You should see a service named "api"
- Click on "api"

### Step 4: Go to Permissions
- Click the "PERMISSIONS" tab (at the top, next to METRICS, LOGS, etc.)

### Step 5: Add Principal
- Click "ADD PRINCIPAL" button
- Principal: `allUsers`
- Role: `Cloud Run Invoker`
- Click "SAVE"

### Step 6: Test
```
https://api-lxdtkbqefq-uc.a.run.app/health
```

---

## 🎯 Key Difference:

| ❌ WRONG (Project Level) | ✅ RIGHT (Service Level) |
|-------------------------|-------------------------|
| `/iam-admin/iam?project=...` | `/run/detail/us-central1/api?project=...` |
| Can't add allUsers | CAN add allUsers |
| Shows all project principals | Shows only this service's permissions |

---

**Close the dialog, go to Cloud Run, click "api", then "PERMISSIONS" tab!**

