import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

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

        // Validate file type (images only)
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Only image files are allowed' },
                { status: 400 }
            );
        }

        // Check if we're in a serverless environment
        const isServerless = process.env.VERCEL === '1';
        
        if (isServerless) {
            // On Vercel/serverless, we cannot persist files
            // Return a temporary data URL or error
            return NextResponse.json(
                { 
                    message: 'File uploads are not supported on Vercel. Please use an external storage service like Cloudinary, AWS S3, or Azure Blob Storage.',
                    error: true 
                },
                { status: 400 }
            );
        }

        // Local development: store in public/uploads
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        
        // Ensure directory exists
        try {
            await fs.mkdir(uploadsDir, { recursive: true });
        } catch {
            // Directory may already exist
        }

        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const filename = `${timestamp}-${random}-${file.name}`;
        const filepath = path.join(uploadsDir, filename);

        // Write file
        await writeFile(filepath, buffer);

        // Return URL
        const url = `/uploads/${filename}`;
        return NextResponse.json({ url });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
