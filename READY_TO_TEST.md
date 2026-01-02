# ✅ Ready to Test!

## Deployment Status

✅ **Frontend**: LIVE at https://uniscrapper-pro.web.app  
✅ **Backend API**: Deployed at https://us-central1-uniscrapper-pro.cloudfunctions.net/api  
✅ **Function**: `api` (v2, Node.js 20, us-central1)

---

## Quick Test

### Option 1: Test Frontend (Browser)
1. Open: https://uniscrapper-pro.web.app
2. Check if the UI loads
3. Try creating a job from the interface
4. Check browser console (F12) for any errors

### Option 2: Test API Directly

**Health Check:**
```powershell
Invoke-RestMethod -Uri "https://us-central1-uniscrapper-pro.cloudfunctions.net/api/health" -Method GET
```

**Create Job:**
```powershell
$jobData = @{
    universityName = "University of Toronto"
    country = "Canada"
    urls = @("https://www.utoronto.ca/admissions")
    autoPublish = $false
    createdBy = "test-user"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://us-central1-uniscrapper-pro.cloudfunctions.net/api/jobs/create" -Method POST -Body $jobData -ContentType "application/json"
```

### Option 3: Use Test Script

Run the test script:
```powershell
.\test-api.ps1
```

---

## What to Check

1. ✅ Frontend loads without errors
2. ✅ API health endpoint returns 200 OK
3. ✅ Can create jobs via API
4. ✅ Jobs appear in Firestore
5. ✅ Frontend can connect to backend

---

**Everything is ready! Start testing!** 🚀


