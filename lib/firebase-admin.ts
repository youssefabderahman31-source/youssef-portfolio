import * as admin from 'firebase-admin';

let isInitialized = false;

const initFirebase = () => {
    if (admin.apps.length > 0) {
        console.log('✓ Firebase already initialized');
        isInitialized = true;
        return;
    }

    // Check if all required credentials are present
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    console.log('🔍 Checking Firebase configuration:');
    console.log(`  FIREBASE_PROJECT_ID: ${projectId ? '✓' : '✗'} ${projectId ? `(${projectId})` : ''}`);
    console.log(`  FIREBASE_CLIENT_EMAIL: ${clientEmail ? '✓' : '✗'} ${clientEmail ? `(${clientEmail})` : ''}`);
    console.log(`  FIREBASE_PRIVATE_KEY: ${privateKey ? '✓ (' + privateKey.length + ' chars)' : '✗'}`);
    console.log(`  FIREBASE_STORAGE_BUCKET: ${storageBucket ? '✓' : '✗'} ${storageBucket ? `(${storageBucket})` : ''}`);

    if (!projectId || !clientEmail || !privateKey || !storageBucket) {
        console.error('❌ Firebase credentials not completely configured.');
        return;
    }

    try {
        // Process the private key carefully
        let processedKey = privateKey;
        // Replace escaped newlines with actual newlines
        if (typeof processedKey === 'string') {
            processedKey = processedKey.replace(/\\n/g, '\n');
        }

        console.log('🔐 Initializing Firebase with credentials...');
        const credential = admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: processedKey,
        });

        admin.initializeApp({
            credential,
            storageBucket,
        });
        
        isInitialized = true;
        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error);
        console.error('Error details:', error instanceof Error ? error.message : error);
    }
};

initFirebase();

export const db = admin.apps.length > 0 ? admin.firestore() : null;
export const storage = admin.apps.length > 0 ? admin.storage() : null;
export const auth = admin.apps.length > 0 ? admin.auth() : null;
export const isFirebaseReady = () => isInitialized && admin.apps.length > 0;
