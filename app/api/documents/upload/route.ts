import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { cookies } from "next/headers";
import { storage, isFirebaseReady, getFirebaseError } from "@/lib/firebase-admin";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  try {
    // Check authorization
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');
    if (!adminToken) {
      console.error('No admin_token found in cookies');
      return NextResponse.json(
        { message: "غير مصرح بالوصول - يرجى تسجيل الدخول من جديد" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "لم يتم تحديد ملف" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "نوع الملف غير مدعوم. استخدم PDF أو Word أو Excel أو PowerPoint" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "حجم الملف أكبر من 50MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    console.log(`📄 Document upload started: ${filename}`);
    console.log(`   Firebase ready: ${isFirebaseReady()}`);

    // Try Firebase Storage first
    if (isFirebaseReady() && storage) {
      try {
        console.log('🔥 Attempting Firebase Storage upload...');

        const tryBucketNames: string[] = [];
        if (process.env.FIREBASE_STORAGE_BUCKET) tryBucketNames.push(process.env.FIREBASE_STORAGE_BUCKET as string);
        if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) tryBucketNames.push(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string);
        if (process.env.FIREBASE_PROJECT_ID) tryBucketNames.push(`${process.env.FIREBASE_PROJECT_ID}.appspot.com`);
        tryBucketNames.push('');

        let lastError: any = null;
        for (const bucketName of tryBucketNames) {
          try {
            const bucket = bucketName ? storage.bucket(bucketName) : storage.bucket();
            console.log(`📦 Trying bucket: ${bucketName || '(default)'} (resolved: ${bucket.name})`);
            const blob = bucket.file(`documents/${filename}`);
            console.log(`📁 Saving to: documents/${filename}`);
            await blob.save(buffer, { metadata: { contentType: file.type } });
            await blob.makePublic();
            const usedBucketName = bucket.name;
            const url = `https://storage.googleapis.com/${usedBucketName}/${blob.name}`;
            console.log(`✅ Firebase upload successful: ${url}`);
            return NextResponse.json({ message: 'تم رفع الملف بنجاح', url, name: file.name, type: file.type, size: file.size }, { status: 200 });
          } catch (err) {
            console.error(`❌ Upload attempt to bucket '${bucketName || '(default)'}' failed:`, err);
            lastError = err;
            const msg = err instanceof Error ? err.message : String(err);
            if (!/bucket does not exist|notFound/i.test(msg)) {
              break;
            }
          }
        }

        console.error('❌ All Firebase bucket attempts failed');
        if (lastError) console.error(lastError);
      } catch (firebaseError) {
        console.error('❌ Firebase Upload failed (outer):', firebaseError);
      }
    } else {
      const fbError = getFirebaseError();
      console.warn('⚠️ Firebase not ready or storage is null');
      console.warn(`   isFirebaseReady: ${isFirebaseReady()}`);
      console.warn(`   storage: ${!!storage}`);
      if (fbError) {
        console.warn(`   Init error: ${fbError.message}`);
      }
    }

    // Fallback only on local development
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('Falling back to local storage (dev environment)...');
        const uploadDir = join(process.cwd(), "public", "documents");
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        return NextResponse.json(
          {
            message: "تم رفع الملف بنجاح",
            url: `/documents/${filename}`,
            name: file.name,
            type: file.type,
            size: file.size,
          },
          { status: 200 }
        );
      } catch (localError) {
        console.error('Local storage fallback failed:', localError);
        throw localError;
      }
    }

    // If we reach here, Firebase failed and we're in production
    const errorMsg = getFirebaseError()?.message || 'Firebase not configured';
    console.warn('⚠️ Falling back to transfer.sh because Firebase failed:', errorMsg);

    // Transfer.sh fallback (temporary public storage)
    try {
      const transferUrl = `https://transfer.sh/${filename}`;
      console.log(`👉 Uploading to transfer.sh: ${transferUrl}`);
      const res = await fetch(transferUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: buffer,
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('transfer.sh upload failed:', res.status, text);
        throw new Error('transfer.sh upload failed');
      }
      const url = (await res.text()).trim();
      console.log('✅ transfer.sh upload successful:', url);
      return NextResponse.json({ message: 'تم رفع الملف بنجاح (مؤقت)', url, name: file.name, type: file.type, size: file.size }, { status: 200 });
    } catch (fallbackErr) {
      console.error('❌ transfer.sh fallback failed:', fallbackErr);
      throw new Error(errorMsg);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Document upload error:", errorMsg);
    console.error("Full error:", error);
    return NextResponse.json(
      { message: `خطأ في رفع الملف: ${errorMsg}` },
      { status: 500 }
    );
  }
}
