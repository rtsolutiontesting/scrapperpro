# 🔧 Remove Deploy Command - Step by Step

The error shows Cloudflare Pages is running `npx wrangler deploy` which shouldn't happen.

## ✅ Solution 1: Check Dashboard Settings (MUST DO)

1. **Go to Cloudflare Dashboard**
   - URL: https://dash.cloudflare.com/505afe6f8d4c43ed3e023813567d5450/pages/view/uniscrapper-frontend/settings

2. **Look for "Build configuration" section**
   - This should be in the Settings tab
   - Scroll down if needed

3. **Find these fields:**
   ```
   Build command:        npm run build        ✅ (keep this)
   Build output dir:     dist                 ✅ (keep this)
   Deploy command:       npx wrangler deploy  ❌ (DELETE THIS!)
   ```

4. **Remove the Deploy command:**
   - Find the "Deploy command" field
   - Delete/clear ALL text in that field
   - Leave it completely EMPTY
   - Save changes

5. **Verify:**
   - Build command: `npm run build` ✅
   - Output directory: `dist` ✅
   - Deploy command: (empty/blank) ✅

6. **Commit and push a change** to trigger a new build, OR click "Retry deployment"

---

## ✅ Solution 2: I've Removed wrangler-pages.toml

I've moved `wrangler-pages.toml` to `wrangler-pages.toml.backup` in case it was being detected.

---

## 🎯 What Should Happen

**Correct behavior:**
1. ✅ Run: `npm run build`
2. ✅ Automatically deploy `dist` folder
3. ❌ NOT run: `npx wrangler deploy`

**Wrong behavior (current):**
1. ✅ Run: `npm run build`
2. ❌ Run: `npx wrangler deploy` ← This is the problem!

---

## 📍 Where to Look in Dashboard

If you can't find "Deploy command" field, look for:
- "Build configuration"
- "Build settings"
- "Deployment settings"
- "Advanced settings"
- Any section with build/deploy options

The deploy command field might be:
- Hidden under "Advanced" or "Show more"
- In a separate "Deployment" section
- Called something else like "Post-build command"

---

**After removing the deploy command, commit and push to trigger a new build!**


