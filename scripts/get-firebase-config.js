/**
 * Helper script to get Firebase configuration
 * Run: node scripts/get-firebase-config.js
 */

console.log('🔥 Firebase Configuration Helper\n');
console.log('To get your Firebase config:');
console.log('');
console.log('1. Go to: https://console.firebase.google.com');
console.log('2. Select your project');
console.log('3. Click the gear icon ⚙️ → "Project settings"');
console.log('4. Scroll to "Your apps" section');
console.log('5. Click the web icon </>');
console.log('6. If no web app exists, click "Add app" → Web icon');
console.log('7. Register the app (check "Also set up Firebase Hosting")');
console.log('8. Copy the firebaseConfig object\n');
console.log('It should look like this:\n');
console.log(`const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};\n`);
console.log('Paste this config and I\'ll configure your project! 🚀\n');


