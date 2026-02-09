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
    try {
      if (!storage) throw new Error('Firebase storage not initialized');

      const bucket = storage.bucket();
      const blob = bucket.file(`documents/${filename}`);

      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.type,
        },
        resumable: false
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', () => resolve(true));
        blobStream.end(buffer);
      });

      await blob.makePublic();
      const url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

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
    } catch (firebaseError) {
      console.warn('Firebase Upload failed, falling back to local storage:', firebaseError);

      // Fallback to local storage
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
    }
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { message: "خطأ في رفع الملف" },
      { status: 500 }
    );
  }
}
