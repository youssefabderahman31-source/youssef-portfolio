import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { cookies } from "next/headers";
import { storage } from "@/lib/firebase-admin";

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

    // Try Firebase Storage first
    if (storage) {
      try {
        console.log('Attempting Firebase Storage upload for document:', filename);
        const bucket = storage.bucket();
        const blob = bucket.file(`documents/${filename}`);

        // Try using save() method instead of streams
        try {
          console.log('Saving file to Firebase Storage...');
          await blob.save(buffer, {
            metadata: {
              contentType: file.type,
            },
          });
          
          console.log('Making blob public...');
          await blob.makePublic();
          const url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          console.log('Firebase upload successful:', url);

          return NextResponse.json(
            {
              message: "تم رفع الملف بنجاح",
              url,
              name: file.name,
              type: file.type,
              size: file.size,
            },
            { status: 200 }
          );
        } catch (saveError) {
          console.error('Save method failed, trying stream approach:', saveError);
          throw saveError;
        }
      } catch (firebaseError) {
        console.error('Firebase Upload failed:', firebaseError);
      }
    } else {
      console.warn('Firebase storage not initialized - check environment variables');
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
    throw new Error('Firebase Storage is not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_STORAGE_BUCKET environment variables.');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Document upload error:", errorMsg);
    return NextResponse.json(
      { message: `خطأ في رفع الملف: ${errorMsg}` },
      { status: 500 }
    );
  }
}
