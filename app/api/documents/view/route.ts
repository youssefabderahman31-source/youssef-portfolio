import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const filename = url.searchParams.get('file');

        if (!filename) {
            return NextResponse.json({ error: 'No file specified' }, { status: 400 });
        }

        // Prevent directory traversal attacks
        if (filename.includes('..') || filename.includes('/')) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
        }

        // Try both uploads and documents directories
        let filePath = path.join(process.cwd(), 'public', 'documents', filename);
        let fileExists = false;

        try {
            await fs.stat(filePath);
            fileExists = true;
        } catch {
            // Try documents folder
            filePath = path.join(process.cwd(), 'public', 'uploads', filename);
            try {
                await fs.stat(filePath);
                fileExists = true;
            } catch {
                // File not found in either location
            }
        }

        if (!fileExists) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const fileBuffer = await fs.readFile(filePath);
        const mimeType = getMimeType(filename);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `inline; filename="${filename}"`,
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('View document error:', error);
        return NextResponse.json({ error: 'Failed to view document' }, { status: 500 });
    }
}

function getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls': 'application/vnd.ms-excel',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.txt': 'text/plain',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}
