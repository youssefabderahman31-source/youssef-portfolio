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
        // ignore
    }
}

await loadDotEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !service) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env or .env.local');
    process.exit(1);
}

const supa = createClient(url, service, { auth: { persistSession: false } });

async function checkTable(table) {
    console.log(`\nChecking table: ${table}`);
    const { data, error } = await supa.from(table).select('*');
    if (error) {
        console.error('Error fetching', table, error.message || error);
        return;
    }
    for (const row of data) {
        const id = row.id;
        const slug = row.slug;
        const doc = row.document_file;
        console.log(`id=${id} slug=${slug} document_file=${doc}`);
        if (doc) {
            // normalize if starts with /documents or /uploads
            let urlToCheck = doc;
            if (doc.startsWith('/documents/') || doc.startsWith('/uploads/')) {
                const bucket = doc.startsWith('/documents/') ? 'documents' : 'uploads';
                const filename = doc.replace(/^\//, '').replace(/^documents\//, '').replace(/^uploads\//, '');
                urlToCheck = `${url.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${filename}`;
            }
            try {
                const res = await fetch(urlToCheck, { method: 'HEAD' });
                console.log(`  HEAD ${urlToCheck} -> ${res.status}`);
            } catch (err) {
                console.error(`  Failed to HEAD ${urlToCheck}:`, err.message || err);
            }
        }
    }
}

await checkTable('companies');
await checkTable('projects');

console.log('\nDone.');
