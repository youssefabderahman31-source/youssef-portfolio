import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        // Check authorization
        const cookieStore = await cookies();
        if (!cookieStore.get('admin_token')) {
            return NextResponse.json({ error: 'Unauthorized', message: 'غير مصرح بالوصول' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded', message: 'لم يتم تحديد ملف' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

        try {
            if (!storage) throw new Error('Firebase storage not initialized');

            const bucket = storage.bucket();
            const blob = bucket.file(`uploads/${filename}`);

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
            return NextResponse.json({ url });
        } catch (firebaseError) {
            console.warn('Firebase Upload failed, falling back to local storage:', firebaseError);

            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            await fs.mkdir(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, filename);
            await fs.writeFile(filePath, buffer);

            const url = `/uploads/${filename}`;
            return NextResponse.json({ url });
        }
    } catch (error) {
        console.error('Upload route error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
