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

                const tryBucketNames: string[] = [];
                if (process.env.FIREBASE_STORAGE_BUCKET) tryBucketNames.push(process.env.FIREBASE_STORAGE_BUCKET as string);
                if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) tryBucketNames.push(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string);
                if (process.env.FIREBASE_PROJECT_ID) tryBucketNames.push(`${process.env.FIREBASE_PROJECT_ID}.appspot.com`);
                // include default (undefined) bucket which uses admin SDK default
                tryBucketNames.push('');

                let lastError: any = null;
                for (const bucketName of tryBucketNames) {
                    try {
                        const bucket = bucketName ? storage.bucket(bucketName) : storage.bucket();
                        console.log(`📦 Trying bucket: ${bucketName || '(default)'}`);
                        const blob = bucket.file(`uploads/${filename}`);
                        console.log(`📁 Saving to: uploads/${filename}`);
                        await blob.save(buffer, { metadata: { contentType: file.type } });
                        await blob.makePublic();
                        const usedBucketName = bucket.name;
                        const url = `https://storage.googleapis.com/${usedBucketName}/${blob.name}`;
                        console.log(`✅ Firebase upload successful: ${url}`);
                        return NextResponse.json({ url });
                    } catch (err) {
                        console.error(`❌ Upload attempt to bucket '${bucketName || '(default)'}' failed:`, err);
                        lastError = err;
                        const msg = err instanceof Error ? err.message : String(err);
                        if (!/bucket does not exist|notFound/i.test(msg)) {
                            // Non-bucket-not-found error — stop retrying
                            break;
                        }
                        // otherwise try next candidate
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
        console.warn('⚠️ Falling back to transfer.sh because Firebase failed:', errorMsg);

        // Try transfer.sh as a temporary fallback (no credentials required)
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
            return NextResponse.json({ url });
        } catch (fallbackErr) {
            console.error('❌ transfer.sh fallback failed:', fallbackErr);
            throw new Error(errorMsg);
        }
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
