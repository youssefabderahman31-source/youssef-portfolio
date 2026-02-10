import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        // Check authorization
        const cookieStore = await cookies();
        const adminToken = cookieStore.get('admin_token');
        if (!adminToken) {
            console.error('No admin_token found in cookies');
            return NextResponse.json({ error: 'Unauthorized', message: 'غير مصرح بالوصول - يرجى تسجيل الدخول من جديد' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded', message: 'لم يتم تحديد ملف' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

        // Try Firebase Storage first
        if (storage) {
            try {
                console.log('Attempting Firebase Storage upload for image:', filename);
                const bucket = storage.bucket();
                const blob = bucket.file(`uploads/${filename}`);

                await new Promise<void>((resolve, reject) => {
                    const blobStream = blob.createWriteStream({
                        metadata: {
                            contentType: file.type,
                        },
                        resumable: false
                    });

                    blobStream.on('error', (err) => {
                        console.error('Stream error:', err);
                        reject(err);
                    });
                    blobStream.on('finish', () => {
                        console.log('Stream finished successfully');
                        resolve();
                    });
                    
                    blobStream.end(buffer);
                });

                console.log('Making blob public...');
                await blob.makePublic();
                const url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                console.log('Firebase upload successful:', url);
                return NextResponse.json({ url });
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
                const uploadDir = path.join(process.cwd(), 'public', 'uploads');
                await fs.mkdir(uploadDir, { recursive: true });

                const filePath = path.join(uploadDir, filename);
                await fs.writeFile(filePath, buffer);

                const url = `/uploads/${filename}`;
                console.log('Local upload successful:', url);
                return NextResponse.json({ url });
            } catch (localError) {
                console.error('Local storage fallback failed:', localError);
                throw localError;
            }
        }

        // If we reach here, Firebase failed and we're in production
        throw new Error('Firebase Storage is not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_STORAGE_BUCKET environment variables.');
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Upload route error:', errorMsg);
        return NextResponse.json({ 
            error: 'Upload failed',
            message: `فشل رفع الملف: ${errorMsg}`
        }, { status: 500 });
    }
}
