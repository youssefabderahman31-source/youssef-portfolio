import fs from 'fs/promises';

(async ()=>{
  try {
    const env = await fs.readFile('.env.local', 'utf8');
    const kv = Object.fromEntries(env.split(/\r?\n/).filter(Boolean).map(l=>{const i=l.indexOf('=');const k=l.slice(0,i);let v=l.slice(i+1);v=v.replace(/^\"|\"$/g,'').trim();return [k,v];}));
    const url = (kv.SUPABASE_URL || kv.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/^\"|\"$/g,'');
    const key = (kv.SUPABASE_SERVICE_ROLE_KEY || kv.SUPABASE_SECRET_KEY || kv.SUPABASE_SERVICE_ROLE_KEY || kv.SUPABASE_ANON_KEY || '').trim().replace(/^\"|\"$/g,'');
    if(!url || !key) { console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(2); }

    const company = {
      id: Date.now().toString(),
      slug: 'test-company-' + Date.now().toString().slice(-4),
      name: 'Test Company (assistant)',
      logo: '',
      description: 'Created by assistant',
      content: '',
      content_ar: '',
      description_ar: ''
    };

    const endpoint = url.replace(/\/+$/,'') + '/rest/v1/companies';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(company)
    });

    const text = await res.text();
    console.log('STATUS', res.status);
    console.log(text);
  } catch (e) {
    console.error(e);
  }
})();
