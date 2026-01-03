# Install Google Cloud CLI (gcloud) on Windows

## 🚀 Quick Installation Guide

### Step 1: Download Google Cloud SDK
1. **Go to:**
   ```
   https://cloud.google.com/sdk/docs/install-sdk#windows
   ```
   Or directly download:
   ```
   https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
   ```

### Step 2: Run the Installer
1. **Double-click `GoogleCloudSDKInstaller.exe`**
2. **Follow the installation wizard:**
   - Click "Next" on welcome screen
   - Choose installation location (default is fine)
   - Click "Install"
   - Wait for installation to complete
   - Click "Finish"

### Step 3: Verify Installation
1. **Open PowerShell** (as Administrator is recommended)
2. **Run:**
   ```powershell
   gcloud --version
   ```
3. **You should see version information** like:
   ```
   Google Cloud SDK 450.0.0
   ...
   ```

### Step 4: Initialize gcloud
1. **Run:**
   ```powershell
   gcloud init
   ```
2. **Follow the prompts:**
   - Sign in with your Google account (browser will open)
   - Select project: `uniscrapper-pro`
   - Choose default region: `us-central1` (or your preference)

### Step 5: Set Default Project (Optional)
```powershell
gcloud config set project uniscrapper-pro
```

### Step 6: Authenticate (If not done in init)
```powershell
gcloud auth login
```
This opens a browser window - sign in with your Google account.

---

## ✅ After Installation: Fix Permissions

Once gcloud is installed and authenticated, run:

```powershell
gcloud run services add-iam-policy-binding api --region=us-central1 --member="allUsers" --role="roles/run.invoker" --project=uniscrapper-pro
```

---

## 🆘 Troubleshooting

### If gcloud command not found after installation:
1. **Close and reopen PowerShell** (important!)
2. **Or restart your computer**
3. **Or manually add to PATH:**
   - Default install path: `C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin`
   - Add this to your system PATH environment variable

### If you get authentication errors:
```powershell
gcloud auth login
```

### If you get project errors:
```powershell
gcloud config set project uniscrapper-pro
```

---

## 📝 Quick Reference

**Download URL:**
https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe

**Installation Guide:**
https://cloud.google.com/sdk/docs/install-sdk#windows

**Verify:**
```powershell
gcloud --version
```

**Fix permissions (after install):**
```powershell
gcloud run services add-iam-policy-binding api --region=us-central1 --member="allUsers" --role="roles/run.invoker" --project=uniscrapper-pro
```

