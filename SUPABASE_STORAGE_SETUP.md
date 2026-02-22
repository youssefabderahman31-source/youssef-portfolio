Supabase Storage setup

1. Create buckets
   - In your Supabase project, open 'Storage' and create two buckets (or one as you prefer): `uploads` and `documents`.
   - Make files public if you want direct public URLs, or use signed URLs for private buckets.

2. Environment variables (Vercel / production)
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key (for client reads)
   - `SUPABASE_SERVICE_ROLE_KEY` = service role key (server-side only, keep secret)

3. Notes
   - Local development uses filesystem `public/uploads` and `public/documents` when `SUPABASE_SERVICE_ROLE_KEY` is not present.
   - On production (Vercel), the app uses `SUPABASE_SERVICE_ROLE_KEY` to upload files to Supabase Storage.
   - Ensure your buckets exist and CORS / public settings match your needs.
   - After creating buckets and setting environment variables on Vercel, perform a redeploy so server code picks up the `SUPABASE_SERVICE_ROLE_KEY` and the app's server-side logic (including revalidation) is active.
   - If admin changes don't appear immediately on the public site, check Vercel deployment logs for `Revalidating paths` messages (they indicate the server attempted to revalidate cached pages). If you see `Revalidation failed` errors, paste the log here for help.

4. Alternative providers
   - For heavy production usage and advanced image transformations, consider Cloudinary or S3.

5. Troubleshooting
   - If uploads fail, check server logs for messages starting with `Supabase storage upload error` or `Document upload to Supabase failed`.
