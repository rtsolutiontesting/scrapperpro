# Fix Permissions - Step by Step

## ✅ You're on the Right Page!

You're at the IAM page: `console.cloud.google.com/iam-admin/iam?project=uniscrapper-pro`

## 📋 Next Steps:

### Step 1: Click "+ Grant access" Button
- It's the blue button on the top right of the principals table
- Click it now

### Step 2: Fill in the Form

**Principal:**
- In the "New principals" field, type: `allUsers`
- Select it from the dropdown (it should show as "allUsers (Public)")

**Role:**
- Click "Select a role" dropdown
- Search for: `Cloud Functions Invoker`
- Select: `Cloud Functions Invoker` (not Cloud Functions Admin)

### Step 3: Save
- Click "Save" button
- Wait a few seconds for the change to apply

### Step 4: Test

After saving, test the health endpoint:
```
https://api-lxdtkbqefq-uc.a.run.app/health
```

You should now get: `{"status":"ok","timestamp":"..."}` instead of 403!

---

## 🎯 Quick Summary:

1. Click "+ Grant access"
2. Principal: `allUsers`
3. Role: `Cloud Functions Invoker`
4. Save
5. Test health endpoint

---

**Ready? Click that "+ Grant access" button!**

