/**
 * Firestore Collections Setup Script
 * 
 * Run this after Firebase initialization to create the required collections
 * 
 * Usage: node scripts/setup-collections.js
 * 
 * Requires: Firebase Admin SDK service account key
 */

const admin = require('firebase-admin');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🔥 Firestore Collections Setup');
  console.log('==============================\n');

  // Get service account key path
  const keyPath = await question('Path to Firebase service account key JSON file: ');
  
  if (!keyPath || keyPath.trim() === '') {
    console.log('❌ Service account key path required');
    process.exit(1);
  }

  try {
    // Initialize Firebase Admin
    const serviceAccount = require(keyPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();

    console.log('\n✅ Firebase Admin initialized\n');

    // Create collections with sample documents (Firestore creates collections on first write)
    console.log('Creating collections...\n');

    // fetch_jobs collection
    console.log('Creating fetch_jobs collection...');
    await db.collection('fetch_jobs').doc('_setup').set({
      _created: new Date(),
      _note: 'Setup document - can be deleted'
    });
    await db.collection('fetch_jobs').doc('_setup').delete();
    console.log('✅ fetch_jobs collection ready');

    // university_programs collection
    console.log('Creating university_programs collection...');
    await db.collection('university_programs').doc('_setup').set({
      _created: new Date(),
      _note: 'Setup document - can be deleted'
    });
    await db.collection('university_programs').doc('_setup').delete();
    console.log('✅ university_programs collection ready');

    // program_versions collection
    console.log('Creating program_versions collection...');
    await db.collection('program_versions').doc('_setup').set({
      _created: new Date(),
      _note: 'Setup document - can be deleted'
    });
    await db.collection('program_versions').doc('_setup').delete();
    console.log('✅ program_versions collection ready');

    // audit_logs collection
    console.log('Creating audit_logs collection...');
    await db.collection('audit_logs').doc('_setup').set({
      _created: new Date(),
      _note: 'Setup document - can be deleted'
    });
    await db.collection('audit_logs').doc('_setup').delete();
    console.log('✅ audit_logs collection ready');

    // diff_results collection
    console.log('Creating diff_results collection...');
    await db.collection('diff_results').doc('_setup').set({
      _created: new Date(),
      _note: 'Setup document - can be deleted'
    });
    await db.collection('diff_results').doc('_setup').delete();
    console.log('✅ diff_results collection ready');

    console.log('\n✅ All collections created successfully!\n');
    console.log('Next steps:');
    console.log('1. Configure Firestore security rules (see firestore.rules)');
    console.log('2. Set up Firebase Functions');
    console.log('3. Deploy backend\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup();

