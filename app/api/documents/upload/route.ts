import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';
import { createServerSupabaseClient } from '@/lib/supabase';

// Note: This endpoint demonstrates local file handling for development.
// On Vercel, files cannot be persisted to the filesystem.
// For production, consider using external services like:
// - Cloudinary
// - AWS S3
// - Google Cloud Storage
// - Azure Blob Storage

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // If Supabase service key is available, upload to Supabase Storage
        if (serviceKey) {
            try {
                const supa = createServerSupabaseClient();
                const timestamp = Date.now();
                const random = Math.random().toString(36).substring(7);
                const filename = `${timestamp}-${random}-${file.name}`;
                const bucket = 'documents';

                const { data, error } = await supa.storage.from(bucket).upload(filename, buffer, {
                    contentType: file.type,
                    upsert: false,
                });

                if (error) {
                    console.error('Supabase storage upload error:', error);
                    throw error;
                }

                const { data: urlData } = supa.storage.from(bucket).getPublicUrl(filename);
                const publicUrl = urlData?.publicUrl || `/documents/${filename}`;

                return NextResponse.json({
                    url: publicUrl,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                });
            } catch (err) {
                console.error('Document upload to Supabase failed, falling back to local file:', err);
                // fall through to local storage
            }
        }

        // Local development: store in public/documents
        const documentsDir = path.join(process.cwd(), 'public', 'documents');

        // Ensure directory exists
        try {
            await fs.mkdir(documentsDir, { recursive: true });
        } catch {
            // Directory may already exist
        }

        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const filename = `${timestamp}-${random}-${file.name}`;
        const filepath = path.join(documentsDir, filename);

        // Write file
        await writeFile(filepath, buffer);

        // Return document metadata
        const url = `/documents/${filename}`;
        return NextResponse.json({
            url,
            name: file.name,
            type: file.type,
            size: file.size,
        });

    } catch (error) {
        console.error('Document upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload document' },
            { status: 500 }
        );
    }
}
