# ✅ FINAL PERMISSIONS FIX URL

## 🔗 DIRECT LINK (Copy & Paste in Your Browser):

```
https://console.cloud.google.com/run/detail/us-central1/api?project=uniscrapper-pro
```

---

## 📋 STEP-BY-STEP:

1. **Copy the URL above** and paste it in your browser (where you're logged into Google Cloud)

2. **Click "PERMISSIONS" tab** (at the top of the page, next to "METRICS", "LOGS", etc.)

3. **Click "ADD PRINCIPAL" button**

4. **Enter:**
   - **Principal:** `allUsers`
   - **Role:** `Cloud Run Invoker`

5. **Click "SAVE"**

6. **Wait a few seconds**

7. **Test:**
   ```
   https://api-lxdtkbqefq-uc.a.run.app/health
   ```

---

## ✅ Expected Result:

After saving, the health endpoint should return:
```json
{
  "status": "ok",
  "timestamp": "2026-01-02T..."
}
```

Instead of 403 Forbidden!

---

**This is the SERVICE-LEVEL permissions page, not PROJECT-LEVEL. That's why it will work!**

