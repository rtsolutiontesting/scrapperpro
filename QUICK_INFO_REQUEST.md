# 📋 Quick Info Request

To make your system live, I just need 3 things:

## 1. Firebase Project ID

Which project do you want to use?

**Your available projects:**
- `agent-follow-up-crm`
- `blpgs-ai-trainer`
- `blpgs-ai-trainer-9d845`
- `canam-marketing-crm`
- `gymaitrainer-d6ef9`
- `i-apply-premium-website`
- `iapply-3`
- `invoicefollowupsystem`
- `oblms-c247d`
- `sample-firebase-ai-app-310dd`
- `sample-firebase-ai-app-7686e`

**Or type "create new" to create a new project**

---

## 2. Firebase Web App Config

1. Go to: https://console.firebase.google.com
2. Select your project
3. Gear ⚙️ → Project settings
4. Scroll to "Your apps"
5. Click web icon `</>`
6. If no app exists, click "Add app" → Web
7. Check "Also set up Firebase Hosting"
8. Copy the entire config object

**Paste it here:**
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## 3. Service Account Key File Path

1. Same Firebase Console → Project Settings ⚙️
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Click "Generate key"
5. Save the JSON file
6. Tell me the full file path

**Example:** `C:\Users\YourName\Downloads\your-project-firebase-adminsdk.json`

---

## That's It! 

Once you provide these 3 things, I'll configure everything and we'll deploy in minutes! 🚀


