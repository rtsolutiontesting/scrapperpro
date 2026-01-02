# 🔗 Your Live URLs

## Frontend (Main Application)
**https://uniscrapper-pro.web.app**

## Backend API
**https://us-central1-uniscrapper-pro.cloudfunctions.net/api**

## API Endpoints

### Health Check
```
GET https://us-central1-uniscrapper-pro.cloudfunctions.net/api/health
```

### Create Job
```
POST https://us-central1-uniscrapper-pro.cloudfunctions.net/api/jobs/create
Content-Type: application/json

{
  "universityName": "University of Toronto",
  "country": "Canada",
  "urls": ["https://www.utoronto.ca/admissions"],
  "autoPublish": false,
  "createdBy": "user"
}
```

### Get Job
```
GET https://us-central1-uniscrapper-pro.cloudfunctions.net/api/jobs/{jobId}
```

### Approve Job
```
POST https://us-central1-uniscrapper-pro.cloudfunctions.net/api/jobs/{jobId}/approve
Content-Type: application/json

{
  "approvedBy": "user",
  "programIds": ["optional", "array", "of", "ids"]
}
```

### Queue Status
```
GET https://us-central1-uniscrapper-pro.cloudfunctions.net/api/queue/status
```

---

## 🔑 Firebase Credentials

**Project ID:** `uniscrapper-pro`

**Firebase Config** (for frontend):
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

## ⚠️ Note

**These URLs are ready but the app needs to be deployed first!**

To deploy now, we need to:
1. Run `firebase init`
2. Deploy functions
3. Build and deploy frontend

**Should I deploy it now?** 🚀

