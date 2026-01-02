# 🌐 Your Live Application URLs

## ✅ Frontend: LIVE NOW!

**https://uniscrapper-pro.web.app**

🎉 **Your frontend is deployed and accessible!**

---

## ⏳ Backend API: Pending Deployment

**Expected URL (after setup):**
**https://us-central1-uniscrapper-pro.cloudfunctions.net/api**

### To Deploy Backend:

1. **Enable Firestore:**
   - Visit: https://console.firebase.google.com/project/uniscrapper-pro/firestore
   - Click "Create database"
   - Choose Production mode
   - Select location
   - Wait 2-3 minutes

2. **Enable Blaze Plan:**
   - Visit: https://console.firebase.google.com/project/uniscrapper-pro/usage/details
   - Click "Upgrade" to Blaze plan
   - (Free tier: 2M invocations/month)

3. **Deploy:**
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   firebase deploy --only functions
   ```

---

## 🔑 Credentials

**Firebase Project ID:** `uniscrapper-pro`

**Firebase Config** (already in your code):
```javascript
{
  apiKey: "AIzaSyC1xJoHny4C7ViqpUTW0MY8rAhk1M8Y2xw",
  authDomain: "uniscrapper-pro.firebaseapp.com",
  projectId: "uniscrapper-pro",
  storageBucket: "uniscrapper-pro.firebasestorage.app",
  messagingSenderId: "921601102504",
  appId: "1:921601102504:web:ed1cdffe7b0c998901289d"
}
```

---

**Frontend is live! Visit it now: https://uniscrapper-pro.web.app** 🚀

