# Firebase Removal & Vercel Setup Guide

## ✅ What's Been Done

Firebase has been completely removed from the project. The application now uses local JSON file storage instead:

### Files Deleted:
- ✌️ `lib/firebase-admin.ts` - Firebase Admin SDK initialization
- ✌️ `app/api/firebase-status/route.ts` - Firebase status endpoint
- ✌️ Old server-side implementations that used Firestore

### Files Modified:
- ✏️ `package.json` - Removed `firebase-admin` dependency, kept `"engines": { "node": "24.x" }`
- ✏️ `lib/data.ts` - Removed all Firebase queries, now uses local JSON only
- ✏️ `lib/content.ts` - Removed Firebase, uses `data/site-content.json`
- ✏️ `.nvmrc` - Updated to Node 24 (required for Vercel compatibility)

### Files Created/Updated:
- ✨ `app/api/upload/route.ts` - Local image upload endpoint (works locally, returns helpful error on Vercel)
- ✨ `app/api/documents/upload/route.ts` - Local document upload endpoint

## 🚀 Deploying to Vercel

### Step 1: Remove Firebase Environment Variables

Delete these from your Vercel project settings (Settings → Environment Variables):
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET`

You can keep:
- `NEXT_PUBLIC_API_ENDPOINT` (if using it)
- `ADMIN_TOKEN_SECRET` (for admin authentication)

### Step 2: Push & Deploy

```bash
git add .
git commit -m "Remove Firebase, use local JSON storage"
git push origin main
```

Vercel will automatically deploy. The build should succeed without any Firebase errors.

### Step 3: Verify

After deployment, verify:
1. Homepage loads: `https://your-domain.vercel.app`
2. Admin page loads: `https://your-domain.vercel.app/admin/login`
3. Try uploading an image in admin dashboard - you'll see a helpful error message about serverless limitations

## 📝 How Data Storage Works Now

### Portfolio Data (`data/portfolio.json`)
```json
{
  "companies": [
    {
      "id": "1234567890",
      "slug": "company-name",
      "name": "Company Name",
      "logo": "https://example.com/logo.png",
      "description": "Description",
      ...
    }
  ],
  "projects": [...]
}
```

### Site Content (`data/site-content.json`)
- Stores page content, translations, settings
- Automatically synced when edited in admin dashboard

### Uploads
- **Locally**: Files saved to `public/uploads/` and `public/documents/`
- **On Vercel**: Cannot persist files (serverless limitation)

## ⚠️ File Upload Limitation

Vercel serverless functions cannot write to the filesystem. The application handles this gracefully:

1. **Locally (npm run dev)**: ✅ Uploads work fine
2. **On Vercel**: ❌ Uploads will show error: "File uploads are not supported on Vercel"

### Solutions for Production Uploads:

**Option 1: Remove Upload Feature** (Simplest)
- Remove upload UI from admin dashboard
- Use external URLs for images/documents

**Option 2: Use External Service** (Recommended)
- **Cloudinary** - best for images
- **AWS S3** - flexible, scalable
- **Azure Blob Storage** - Microsoft ecosystem
- **Google Cloud Storage** - GCP ecosystem

**Option 3: Use R2/Wasabi**
- Worker-friendly, Vercel Edge Function compatible

## 🔧 Local Development

### Run locally:
```bash
npm install
npm run dev
```

Navigate to `http://localhost:3000`

### Admin Dashboard:
- URL: `http://localhost:3000/admin/login`
- Default: `admin_token` cookie-based auth (configured in `app/api/admin/check/route.ts`)

### Upload test (locally):
1. Go to admin dashboard
2. Create/edit a company or project
3. Upload an image → saved to `public/uploads/`
4. Image appears in preview

## 🗄️ Database Schema (Local JSON)

### Company
```typescript
{
  id: string;
  slug: string;
  name: string;
  logo: string;
  description: string;
  description_ar?: string;
  content?: string;
  content_ar?: string;
  documentFile?: string;
  documentName?: string;
  documentType?: string;
}
```

### Project
```typescript
{
  id: string;
  slug: string;
  name: string;
  description: string;
  description_ar?: string;
  companyId: string;
  documentFile?: string;
  documentName?: string;
  documentType?: string;
  content?: string;
  content_ar?: string;
}
```

## 🔐 Authentication

Admin endpoints are protected by `admin_token` cookie:
- Set during login process
- Verified in `/app/api/admin/check/route.ts`
- Checked before allowing data modifications

## 📊 API Endpoints

### Admin Endpoints (Protected)
- `POST /api/admin/companies` - Create/update companies
- `DELETE /api/admin/delete` - Delete companies/projects
- `POST /api/admin/projects` - Create/update projects
- `GET /api/admin/check` - Check authentication status

### Public Endpoints
- `GET /api/content` - Fetch site content
- `GET /api/documents/view` - View uploaded documents
- `GET /api/files/view` - View uploaded files

### Upload Endpoints
- `POST /api/upload` - Upload image (works locally)
- `POST /api/documents/upload` - Upload document (works locally)

## 🐛 Troubleshooting

### "Cannot find module 'firebase-admin'"
- Clear `.next` cache: `rm -r .next`
- Rebuild: `npm run build`

### Admin pages show 404
- Make sure you're authenticated (check `admin_token` cookie)
- Cookie set by login form submission

### Uploads don't work on Vercel
- This is expected! Use external service instead
- See "Solutions for Production Uploads" above

### Build fails
- Check Node version: must be 24.x
- Check `.nvmrc` file
- Clear cache: `npm run build` (After deleting `.next`)

## 📚 Additional Notes

- All Firebase credentials and complexity removed ✅
- No external service needed for data storage (uses local JSON)
- Admin authentication uses simple cookie-based system
- Completely static-friendly, works on any Node.js 24.x hosting

## 🎯 Next Steps

1. **For Production Uploads**: Choose and integrate external service (Cloudinary recommended)
2. **Add Logging**: Consider adding error tracking (Sentry, LogRocket)
3. **Backup Strategy**: Implement JSON file backups for `data/` directory
4. **CI/CD**: Set up GitHub Actions for automated testing

---

**Project is now Firebase-free and ready for production!** 🚀
