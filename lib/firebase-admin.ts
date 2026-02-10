import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let isInitialized = false;
let initError: Error | null = null;

const normalizePrivateKey = (key: string) => {
    if (!key) return key;
    // Remove surrounding quotes if present and convert escaped \n sequences to real newlines
    let k = key.replace(/^\"|\"$/g, '');
    k = k.replace(/\\n/g, '\n');
    return k;
};

const loadServiceAccountFromEnv = () => {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || '';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || (process.env.client_email as string) || '';
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY || (process.env.private_key as string) || '';
    if (!privateKeyRaw) return null;
    const privateKey = normalizePrivateKey(privateKeyRaw);
    return projectId && clientEmail && privateKey ? { projectId, clientEmail, privateKey } : null;
};

const loadServiceAccountFromFile = () => {
    try {
        const candidate = path.resolve(process.cwd(), 'firebase-service-account.json');
        if (fs.existsSync(candidate)) {
            const raw = fs.readFileSync(candidate, 'utf8');
            const parsed = JSON.parse(raw);
            if (parsed && parsed.private_key && parsed.client_email && parsed.project_id) {
                return {
                    projectId: parsed.project_id,
                    clientEmail: parsed.client_email,
                    privateKey: normalizePrivateKey(parsed.private_key),
                };
            }
        }
    } catch (e) {
        // ignore and fall through
    }
    return null;
};

const getServiceAccount = () => {
    const fromEnv = loadServiceAccountFromEnv();
    if (fromEnv) return fromEnv;
    const fromFile = loadServiceAccountFromFile();
    if (fromFile) return fromFile;
    return null;
};

const initFirebase = () => {
    if (admin.apps.length > 0) {
        console.log('✓ Firebase already initialized');
        isInitialized = true;
        return;
    }

    try {
        const sa = getServiceAccount();
        if (!sa) {
            throw new Error('Firebase service account not configured. Set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and FIREBASE_PROJECT_ID.');
        }

        const serviceAccount = {
            projectId: sa.projectId,
            clientEmail: sa.clientEmail,
            privateKey: sa.privateKey,
        } as any;

        console.log('🚀 Initializing Firebase Admin SDK...');

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
        });

        isInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ Firebase init failed:', errorMsg);
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
