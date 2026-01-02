# 🚀 Cloudflare Workers Deployment Guide

## Step-by-Step Instructions

### Prerequisites
- ✅ Cloudflare account (free tier works)
- ✅ Wrangler CLI installed (already done)
- ✅ Code ready in `worker/` directory (already done)

---

## Step 1: Login to Cloudflare

Open PowerShell/Terminal and run:

```bash
cd worker
wrangler login
```

This will:
- Open your browser
- Ask you to login to Cloudflare
- Authorize Wrangler CLI

**Expected output**: "Successfully logged in"

---

## Step 2: Verify Configuration

Check that `wrangler.toml` is correct:

```bash
wrangler whoami
```

This shows your Cloudflare account email.

---

## Step 3: Deploy the Worker

Deploy your worker:

```bash
wrangler deploy
```

**First deployment will:**
- Ask you to confirm creating the worker
- Upload your code
- Deploy to Cloudflare's edge network
- Give you a URL like: `university-data-api.your-subdomain.workers.dev`

**Expected output**: 
```
✨ Success! Uploaded university-data-api
Published university-data-api (X.XX sec)
  https://university-data-api.your-subdomain.workers.dev
```

---

## Step 4: Test Your API

After deployment, test it:

```bash
# Health check
curl https://university-data-api.your-subdomain.workers.dev/health
```

Or visit in browser:
```
https://university-data-api.your-subdomain.workers.dev/health
```

---

## Step 5: Update Frontend (Optional)

If you want to connect your frontend to the new API:

1. Update API URL in your frontend code
2. Point it to your Cloudflare Worker URL
3. Redeploy frontend

---

## Troubleshooting

### If login fails:
- Make sure you have a Cloudflare account
- Try `wrangler logout` then `wrangler login` again

### If deploy fails:
- Check you're in the `worker` directory
- Verify `wrangler.toml` exists
- Check `src/index.ts` exists

### If you get rate limit errors:
- Cloudflare free tier has limits
- Check your account dashboard

---

## Next Steps After Deployment

1. ✅ Test all endpoints
2. ✅ Add Firebase Firestore integration (if needed)
3. ✅ Add environment variables (if needed)
4. ✅ Set up custom domain (optional)

---

**Ready to deploy? Start with Step 1!** 🎉


