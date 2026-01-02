#!/bin/bash
# Firebase Setup Script
# Run this after providing your Firebase project details

set -e

echo "🔥 Firebase Setup Script"
echo "========================="
echo ""

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in
echo "Checking Firebase login status..."
if ! firebase projects:list &> /dev/null; then
    echo "Please log in to Firebase:"
    firebase login
fi

echo ""
echo "✅ Firebase CLI ready"
echo ""
echo "Next steps:"
echo "1. Run: firebase init"
echo "2. Select:"
echo "   - Firestore"
echo "   - Functions"
echo "   - Hosting (optional, if not using Cloudflare Pages)"
echo "3. Select your Firebase project"
echo "4. Follow the prompts"
echo ""
echo "After initialization, run the setup-collections script to create Firestore collections."


