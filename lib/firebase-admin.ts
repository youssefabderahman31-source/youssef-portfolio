import * as admin from 'firebase-admin';

const initFirebase = () => {
    if (admin.apps.length > 0) {
        console.log('✓ Firebase already initialized');
        return;
    }

    // Check if all required credentials are present
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    console.log('🔍 Checking Firebase configuration:');
    console.log(`  FIREBASE_PROJECT_ID: ${projectId ? '✓' : '✗'}`);
    console.log(`  FIREBASE_CLIENT_EMAIL: ${clientEmail ? '✓' : '✗'}`);
    console.log(`  FIREBASE_PRIVATE_KEY: ${privateKey ? '✓ (' + privateKey.length + ' chars)' : '✗'}`);
    console.log(`  FIREBASE_STORAGE_BUCKET: ${storageBucket ? '✓' : '✗'}`);

    if (!projectId || !clientEmail || !privateKey || !storageBucket) {
        console.warn('⚠️ Firebase credentials not completely configured. Uploads will fail on production.');
        return;
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
            storageBucket,
        });
        console.log('✓ Firebase initialized successfully');
    } catch (error) {
        console.error('✗ Failed to initialize Firebase:', error);
    }
};

initFirebase();

export const db = admin.apps.length > 0 ? admin.firestore() : null;
export const storage = admin.apps.length > 0 ? admin.storage() : null;
export const auth = admin.apps.length > 0 ? admin.auth() : null;
