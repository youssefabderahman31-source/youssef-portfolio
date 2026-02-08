import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CONTENT_FILE_PATH = path.join(process.cwd(), "data", "site-content.json");

export async function GET() {
    try {
        const fileContent = await fs.readFile(CONTENT_FILE_PATH, "utf-8");
        const content = JSON.parse(fileContent);
        return NextResponse.json(content);
    } catch (error) {
        console.error("Error reading content:", error);
        return NextResponse.json({ error: "Failed to read content" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const newContent = await request.json();

        // Write to file
        await fs.writeFile(
            CONTENT_FILE_PATH,
            JSON.stringify(newContent, null, 2),
            "utf-8"
        );

        return NextResponse.json({ success: true, message: "Content updated successfully" });
    } catch (error) {
        console.error("Error saving content:", error);
        return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
    }
}
