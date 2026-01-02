# 🧪 Testing Guide

## Quick Test Steps

### 1. Test Frontend (Already Live)

**URL:** https://uniscrapper-pro.web.app

Open this URL in your browser and verify:
- ✅ Page loads without errors
- ✅ UI displays correctly
- ✅ No console errors (F12 → Console)

---

### 2. Test Backend API

Once backend is deployed, test these endpoints:

#### Health Check
```bash
curl https://us-central1-uniscrapper-pro.cloudfunctions.net/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-01-XX..."}
```

#### Create a Test Job
```bash
curl -X POST https://us-central1-uniscrapper-pro.cloudfunctions.net/api/jobs/create \
  -H "Content-Type: application/json" \
  -d '{
    "universityName": "University of Toronto",
    "country": "Canada",
    "urls": ["https://www.utoronto.ca/admissions"],
    "autoPublish": false,
    "createdBy": "test-user"
  }'
```

Expected response:
```json
{
  "job": {
    "id": "...",
    "universityName": "University of Toronto",
    "status": "QUEUED",
    ...
  }
}
```

#### Get Job Status
```bash
curl https://us-central1-uniscrapper-pro.cloudfunctions.net/api/jobs/{JOB_ID}
```

Replace `{JOB_ID}` with the ID from the create response.

---

### 3. Test from Frontend

1. Open: https://uniscrapper-pro.web.app
2. Create a new job using the UI
3. Monitor job status
4. Check for any errors in browser console (F12)

---

## Test Data

**Sample University URLs:**
- University of Toronto: `https://www.utoronto.ca/admissions`
- MIT: `https://mitadmissions.org/`
- Stanford: `https://admission.stanford.edu/`

---

## Troubleshooting

### Frontend Issues
- Check browser console (F12)
- Verify Firebase config is correct
- Check network tab for API calls

### Backend Issues
- Check Firebase Functions logs
- Verify Firestore is enabled
- Check API endpoint URLs

---

**Ready to test!** 🚀

