import * as admin from 'firebase-admin';

let isInitialized = false;
let initError: Error | null = null;

const initFirebase = () => {
    if (admin.apps.length > 0) {
        console.log('✓ Firebase already initialized');
        isInitialized = true;
        return;
    }

    try {
        // Hardcode the credentials for now - will use env vars
        const serviceAccount = {
            projectId: "youssef7abderahman",
            privateKeyId: "f37de0cf9b099f72d2cfb1afd7ea9353d75e1f39",
            privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDi3Df5ga0V3FTe\np43qOhFQOkqXyZRRzIFaY82HRH1VzOp68EPhlCGzgXGu7K/nxb042fOSGWzLB1i3\nsOEthk+qd8k1r1D1TsNrf0V0RMFV8A3OGTEltI1TY4a1DZAr7ygmvNoczm0Ljonh\nX8119zPEe/jc9kFXVYWXKC04YJs3Lv0+Bmj5oHCMXIW7t2JtIjtF7VFrY7Szi9Mo\nj+J9Y5jabB8J5IPrxp5WQQwD0QBbPMvytBO6Vfty/dGlXnLdZwJrjMhGl4dFN3Xa\nHBuQS8bocGRl1Pf3EzfTHY28woE2LjQCDLEHQar+Zdhk3GQ11Q4PRwHtUXOBDJt/\nG9bEl5mbAgMBAAECggEAWKy90HBoyJ+8KOATr9eMxvBSEezAZgzrDvrt7o7N8wjL\nKszZq8YsOi9B0Z9AzvbTFPLUq2n2xZGUkxC3pATZBQgXhT2HBqwH5O/1pRHvBHl1\n2/aq6FMf3tWLZR/tF88+wY2WMCZcJ2VK7eZ1uEOtX4MZ7rzvI4URV9lje6L/aNzf\nrweT+w/PtsxriU7Y0d3lGpgUiERQcfB4YyNxnEQeOWwEOzcmY8tNVZyHy8Oi445+\nRoouSmr23L2Z5zC4RSQ9/xE5vNjINbZ+4JvTUMpTj4p9je5MbwgRu3igw2BMgQSl\nELf0AGZUoUid0U/ndd3pad+hKymvGSUeteHjkzYyCQKBgQD45P0s4pRlnev7J7JM\nkzEJvg9FGthARFgs4DsuPaGsmp7UpvowCi1hwmzEfjf80dsRyzut0wmLp52Z1GCy\npJOgalu/7kxOXhjkU3w1tTY0HfVKMbcFZYL3EYeSbUg3/s25OO5FYn7lix1jg6rz\nfPD+UrksTJgGtDu094n039qU5wKBgQDpVjIB7qfr4svHAsMypSPcMUh0yCMJe51G\nsJ+RIBI+nn8izOQivpMt6wXNa4VM5WB4PNTg2xqoLhDQd5MJgTPY7r3XToZusTAr\nvg+N8rEyUPsleM2G/Jt85A8y50vWig97ip7CEAvXrA2I4IlN4z0wgcXMAZyIFWpm\nZ5XJBN6LLQKBgQDuNhupzeHBr/efFUssxuN0M5dhyGOYftD1glah1xLZo9LILFff\nip4Mpox7M2Jacm99BEpF/2lvZCkOhZlW4PT531GYzHXzu1OPk+eZb6pFDzcon5RP\ncex6kyhyGG26SgCTec1yUuaowxCJogcHq1jr0DiyEUyfffh3J0O+PlFxmQKBgQCu\nTyPgaaasAqr0Kk4jwVX+ohpckz4JUXz2V+97/JdkjAaxupoakn9kaBPXlyDnhtsA\nN4FX0JYjWPZapVkEWq6eugq7kv++JUO1CbCY+9n/mptjLNFsq7yEGeJ4xmzTAiP6\nyF0837vZC8C4pfQsaTtGx0s50WJcDpODmJI+rxKIqQKBgH6pkehHbDDcyokDTJ3B\naxfP8VI6yJ6h2byBGNg/pR9fFIM9z+/28n5LcBb7QUdTbVIlJ5wL1QH+dZon1SG2\neWaTurXeBYmJgXnKjRJKUp8kQ/N672hVHysDsROtamEb7rlm4CRzcqGxwb/wS67J\niHTQLGz73nCKI+Zes9KdfUlk\n-----END PRIVATE KEY-----\n",
            clientEmail: "firebase-adminsdk-fbsvc@youssef7abderahman.iam.gserviceaccount.com",
            clientId: "113885472269512728007",
            authUri: "https://accounts.google.com/o/oauth2/auth",
            tokenUri: "https://oauth2.googleapis.com/token",
            authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
            clientX509CertUrl: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40youssef7abderahman.iam.gserviceaccount.com",
        };

        console.log('🚀 Initializing Firebase Admin SDK...');
        
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: "youssef7abderahman.appspot.com",
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
