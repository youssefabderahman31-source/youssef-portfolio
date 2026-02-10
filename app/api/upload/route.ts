import { NextRequest, NextResponse } from 'next/server';
import { storage, isFirebaseReady, getFirebaseError } from '@/lib/firebase-admin';
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

        console.log(`🖼️ Image upload started: ${filename}`);
        console.log(`   Firebase ready: ${isFirebaseReady()}`);

        // Try Firebase Storage first
        if (isFirebaseReady() && storage) {
            try {
                console.log('🔥 Attempting Firebase Storage upload...');
                const bucket = storage.bucket();
                console.log(`📦 Using bucket: ${bucket.name}`);
                
                const blob = bucket.file(`uploads/${filename}`);
                console.log(`📁 Saving to: uploads/${filename}`);

                await blob.save(buffer, {
                    metadata: {
                        contentType: file.type,
                    },
                });

                console.log('🔓 Making file public...');
                await blob.makePublic();
                const url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                console.log(`✅ Firebase upload successful: ${url}`);
                return NextResponse.json({ url });
            } catch (firebaseError) {
                console.error('❌ Firebase Upload failed:', firebaseError);
                const errorMsg = firebaseError instanceof Error ? firebaseError.message : String(firebaseError);
                console.error(`   Error: ${errorMsg}`);
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
        const errorMsg = getFirebaseError()?.message || 'Firebase not configured';
        throw new Error(errorMsg);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ Upload route error:', errorMsg);
        console.error('Full error:', error);
        return NextResponse.json({ 
            error: 'Upload failed',
            message: `فشل رفع الملف: ${errorMsg}`
        }, { status: 500 });
    }
}
