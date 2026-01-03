# Fix Permissions - CORRECT Method

## ⚠️ Issue: 
You're at PROJECT level IAM, but need FUNCTION level permissions.

**Error:** "allUsers cannot be added to this resource"
- This happens because you're at project-level IAM
- Functions need permissions at the FUNCTION level, not project level

## ✅ Solution: Use Firebase Console (Easier)

### Option 1: Firebase Functions Console (Recommended)

1. **Go to Firebase Functions:**
   ```
   https://console.firebase.google.com/project/uniscrapper-pro/functions
   ```

2. **Click on the `api` function**

3. **Click "Permissions" or "IAM" tab**

4. **Click "Add member" or "Add principal"**

5. **Enter:** `allUsers`

6. **Role:** `Cloud Functions Invoker` or `Cloud Run Invoker`

7. **Save**

---

## ✅ Option 2: Cloud Run Console (Alternative)

1. **Go to Cloud Run:**
   ```
   https://console.cloud.google.com/run?project=uniscrapper-pro
   ```

2. **Find the service named `api`**

3. **Click on it**

4. **Go to "Permissions" tab**

5. **Click "Add principal"**

6. **Principal:** `allUsers`

7. **Role:** `Cloud Run Invoker`

8. **Save**

---

## ✅ Option 3: Using gcloud CLI

If you have gcloud CLI installed:

```bash
gcloud run services add-iam-policy-binding api \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --project=uniscrapper-pro
```

---

**The key difference:** You need FUNCTION/CLOUD RUN level permissions, not PROJECT level!

