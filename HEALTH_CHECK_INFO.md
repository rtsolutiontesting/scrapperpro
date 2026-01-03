# Health Check URL & 403 Error Fix

## 🔗 Health Check URL:
```
https://api-lxdtkbqefq-uc.a.run.app/health
```

## ⚠️ Current Issue: 403 Forbidden

The endpoint is returning 403, which means the function requires authentication or isn't configured for public access.

## 🔧 Solution: Allow Unauthenticated Invocations

Firebase Functions v2 (Cloud Run) requires you to allow unauthenticated access.

### Option 1: Firebase Console (Recommended)

1. Go to Firebase Functions:
   https://console.firebase.google.com/project/uniscrapper-pro/functions

2. Click on the `api` function

3. Go to "Permissions" tab

4. Click "Add principal"

5. Add: `allUsers` with role `Cloud Functions Invoker`

6. Click "Save"

### Option 2: Using gcloud CLI

```bash
gcloud functions add-iam-policy-binding api \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker"
```

### Option 3: Check Function Code

The function should have `cors: true` in the export (which it does). The issue is IAM permissions on Cloud Run.

---

## ✅ After Fixing Permissions

Once unauthenticated access is allowed, the health endpoint should return:

```json
{
  "status": "ok",
  "timestamp": "2026-01-02T..."
}
```

## 🧪 Test Other Endpoints

After fixing permissions:
- Health: `GET /health`
- Create Job: `POST /jobs/create`
- Get Job: `GET /jobs/:jobId`
- Queue Status: `GET /queue/status`

