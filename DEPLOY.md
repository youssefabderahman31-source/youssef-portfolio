Deploy & Production checklist

1) Create Supabase buckets
   - Open your Supabase project → Storage → Create buckets:
     - `uploads`
     - `documents`
   - Option: Make buckets public if you want direct public URLs. Otherwise use signed URLs.

2) Add environment variables in Vercel (Project Settings → Environment Variables) or via Vercel CLI
   - `NEXT_PUBLIC_SUPABASE_URL` = https://xyzcompany.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key (server-side only)

   Example using Vercel CLI (replace values):

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

3) Ensure buckets exist and are accessible
   - If using public files: mark objects public in Supabase or configure appropriate policies.
   - If private: you must update your API to use signed URLs for downloads (Supabase supports signed URLs).

4) Redeploy
   - Push to the branch linked to Vercel (e.g., `main`) or use `vercel --prod` to deploy immediately.

5) Verify after deploy
   - Test image upload flow from Admin UI — the server will upload files to Supabase Storage when `SUPABASE_SERVICE_ROLE_KEY` is present.
   - Test creating a company via admin UI and confirm the record exists in Supabase (`companies` table).

6) Useful debug commands (local)

```bash
# start dev server
npm run dev

# test company create
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"company": {"name":"Test","slug":"test","logo":"","description":""}}' \
  http://localhost:3000/api/admin/companies | jq

# test upload (local)
curl -s -X POST -F "file=@/path/to/file.jpg" http://localhost:3000/api/upload | jq
```

7) Notes
   - Vercel serverless filesystem is read-only: we fall back to Supabase Storage in production. Local dev still writes to `public/uploads` and `public/documents` for convenience.
   - If you prefer Cloudinary or S3, I can replace Supabase Storage integration with that provider.
