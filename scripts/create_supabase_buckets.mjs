import fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

async function loadDotEnv() {
    try {
        const txt = await fs.readFile('.env.local', 'utf8');
        for (const line of txt.split(/\r?\n/)) {
            const m = line.match(/^([^#=]+)=(.*)$/);
            if (!m) continue;
            const key = m[1].trim();
            let val = m[2].trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (typeof process.env[key] === 'undefined') process.env[key] = val;
        }
    } catch (err) {
        // no .env.local — ignore
    }
}

await loadDotEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment or .env.local');
    process.exit(1);
}

const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false },
});

const buckets = ['uploads', 'documents'];

for (const bucket of buckets) {
    try {
        const { data, error } = await supabase.storage.createBucket(bucket, { public: true });
        if (error) {
            // Supabase may return an error if bucket exists
            if (error.message && error.message.toLowerCase().includes('already exists')) {
                console.log(`Bucket already exists: ${bucket}`);
            } else {
                console.error(`Failed to create bucket ${bucket}:`, error.message || error);
            }
        } else {
            console.log(`Created bucket: ${bucket}`);
        }
    } catch (err) {
        console.error(`Error creating bucket ${bucket}:`, err.message || err);
    }
}

console.log('Done. Verify buckets in Supabase dashboard.');
