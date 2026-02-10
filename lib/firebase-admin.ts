import * as admin from 'firebase-admin';

let isInitialized = false;
let initError: Error | null = null;

const initFirebase = () => {
    if (admin.apps.length > 0) {
        console.log('✓ Firebase already initialized, apps count:', admin.apps.length);
        isInitialized = true;
        return;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.private_key;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    console.log('🔍 Firebase Init Check:');
    console.log(`  projectId: ${projectId ? '✓' : '✗'}`);
    console.log(`  clientEmail: ${clientEmail ? '✓' : '✗'}`);
    console.log(`  privateKey (FIREBASE_PRIVATE_KEY): ${process.env.FIREBASE_PRIVATE_KEY ? '✓' : '✗'}`);
    console.log(`  privateKey (private_key): ${process.env.private_key ? '✓' : '✗'}`);
    console.log(`  privateKey (resolved): ${privateKey ? `✓ (${privateKey.length} chars)` : '✗'}`);
    console.log(`  storageBucket: ${storageBucket ? '✓' : '✗'}`);

    if (!projectId || !clientEmail || !privateKey || !storageBucket) {
        const msg = '❌ Firebase credentials incomplete!';
        console.error(msg);
        initError = new Error(msg);
        return;
    }

    try {
        console.log('🔐 Processing private key...');
        // Handle private key carefully - ensure proper newline conversion
        let processedKey = privateKey;
        
        // If the key starts and ends with quotes, remove them
        if (processedKey.startsWith('"') && processedKey.endsWith('"')) {
            processedKey = processedKey.slice(1, -1);
        }
        
        // Convert escaped newlines to actual newlines - try both patterns
        processedKey = processedKey.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n');
        
        console.log(`  Key length: ${processedKey.length}`);
        console.log(`  Key starts with: ${processedKey.substring(0, 30)}...`);
        console.log(`  Key ends with: ...${processedKey.substring(processedKey.length - 30)}`);

        console.log('🚀 Initializing Firebase Admin SDK...');
        const credential = admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: processedKey,
        });

        const app = admin.initializeApp({
            credential,
            storageBucket,
        });

        isInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully');
        console.log(`  App name: ${app.name}`);
        console.log(`  Apps count: ${admin.apps.length}`);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ Firebase init failed:', errorMsg);
        console.error('Full error:', error);
        initError = error instanceof Error ? error : new Error(errorMsg);
    }
};

// Initialize on module load
console.log('📦 Firebase Admin module loaded');
initFirebase();

export const db = admin.apps.length > 0 ? admin.firestore() : null;
export const storage = admin.apps.length > 0 ? admin.storage() : null;
export const auth = admin.apps.length > 0 ? admin.auth() : null;

export const isFirebaseReady = () => {
    const ready = isInitialized && admin.apps.length > 0 && !!storage;
    console.log(`⚡ Firebase Ready Check: ${ready ? '✓' : '✗'} (initialized: ${isInitialized}, apps: ${admin.apps.length}, storage: ${!!storage})`);
    return ready;
};

export const getFirebaseError = () => initError;
