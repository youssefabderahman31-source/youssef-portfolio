import * as admin from 'firebase-admin';

const initFirebase = () => {
    if (admin.apps.length > 0) {
        return;
    }

    // Check if all required credentials are present
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        console.warn('⚠️ Firebase credentials not configured. Using local data fallback.');
        return;
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
    } catch (error) {
        console.warn('⚠️ Failed to initialize Firebase. Using local data fallback:', error);
    }
};

initFirebase();

export const db = admin.apps.length > 0 ? admin.firestore() : null;
export const storage = admin.apps.length > 0 ? admin.storage() : null;
export const auth = admin.apps.length > 0 ? admin.auth() : null;
