# ✅ Testing Guide - Verify Everything Works

## ✅ API Status: WORKING!

Your health check shows:
```json
{
  "status": "ok",
  "timestamp": "2026-01-02T08:23:31.500Z",
  "platform": "cloudflare-workers"
}
```

---

## 🧪 Complete Testing Guide

### 1. Test API Endpoints

#### Health Check (Already Working! ✅)
**URL**: https://university-data-api.rtsolutiontesting.workers.dev/health

**Browser**: Just visit the URL
**Expected**: `{"status":"ok","timestamp":"...","platform":"cloudflare-workers"}`

---

#### Create a Job
**URL**: https://university-data-api.rtsolutiontesting.workers.dev/jobs/create

**Method**: POST
**Body** (JSON):
```json
{
  "universityName": "University of Toronto",
  "country": "Canada",
  "urls": ["https://www.utoronto.ca/admissions"],
  "autoPublish": false,
  "createdBy": "test-user"
}
```

**How to Test**:
- Use Postman/Insomnia
- Or browser console:
```javascript
fetch('https://university-data-api.rtsolutiontesting.workers.dev/jobs/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    universityName: "University of Toronto",
    country: "Canada",
    urls: ["https://www.utoronto.ca/admissions"],
    autoPublish: false,
    createdBy: "test-user"
  })
}).then(r => r.json()).then(console.log)
```

**Expected Response**:
```json
{
  "job": {
    "id": "job-...",
    "universityName": "University of Toronto",
    "status": "QUEUED",
    "createdAt": "..."
  }
}
```

---

#### Queue Status
**URL**: https://university-data-api.rtsolutiontesting.workers.dev/queue/status

**Browser**: Just visit the URL
**Expected**: `{"status":"operational","queueLength":0,"processing":false}`

---

### 2. Test Frontend

**URL**: https://uniscrapper-pro.web.app

**Check**:
1. ✅ Page loads without errors
2. ✅ No console errors (F12 → Console)
3. ✅ UI displays correctly
4. ✅ API calls work (if integrated)

---

### 3. Quick Test Script

Save as `test-api.html` and open in browser:

```html
<!DOCTYPE html>
<html>
<head>
    <title>API Test</title>
</head>
<body>
    <h1>API Testing</h1>
    <button onclick="testHealth()">Test Health</button>
    <button onclick="testCreateJob()">Create Job</button>
    <button onclick="testQueueStatus()">Queue Status</button>
    <pre id="result"></pre>

    <script>
        const API_URL = 'https://university-data-api.rtsolutiontesting.workers.dev';
        
        async function testHealth() {
            const res = await fetch(`${API_URL}/health`);
            const data = await res.json();
            document.getElementById('result').textContent = JSON.stringify(data, null, 2);
        }
        
        async function testCreateJob() {
            const res = await fetch(`${API_URL}/jobs/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    universityName: "University of Toronto",
                    country: "Canada",
                    urls: ["https://www.utoronto.ca/admissions"],
                    autoPublish: false,
                    createdBy: "test-user"
                })
            });
            const data = await res.json();
            document.getElementById('result').textContent = JSON.stringify(data, null, 2);
        }
        
        async function testQueueStatus() {
            const res = await fetch(`${API_URL}/queue/status`);
            const data = await res.json();
            document.getElementById('result').textContent = JSON.stringify(data, null, 2);
        }
    </script>
</body>
</html>
```

---

## ✅ Quick Checklist

- ✅ Health endpoint: Working
- ⏳ Create job endpoint: Test it
- ⏳ Queue status endpoint: Test it
- ⏳ Frontend: Test it
- ⏳ Integration: Connect frontend to API

---

**Your API is confirmed working! Now test the other endpoints!** 🎉

