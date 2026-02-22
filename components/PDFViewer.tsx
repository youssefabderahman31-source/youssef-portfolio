"use client";

import React from "react";
import { Download, Eye, FileText, AlertCircle } from "lucide-react";

interface PDFViewerProps {
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
}

export default function PDFViewer({ fileUrl, fileName, fileType }: PDFViewerProps) {
    const handleOpenPDF = () => {
        if (!fileUrl) {
            alert("عذراً، رابط الملف غير متوفر");
            return;
        }

        // If it's already an absolute URL (Supabase), open directly
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
            window.open(fileUrl, "_blank");
            return;
        }

        // Extract filename from URL
        const filename = fileUrl.split('/').pop() || 'document';
        
        // Determine which API endpoint to use based on the URL path
        const isDocument = fileUrl.includes('/documents/');
        const endpoint = isDocument ? '/api/documents/view' : '/api/files/view';
        const apiUrl = `${endpoint}?file=${encodeURIComponent(filename)}`;
        
        window.open(apiUrl, "_blank");
    };

    const handleDownloadPDF = () => {
        if (!fileUrl) {
            alert("عذراً، رابط الملف غير متوفر");
            return;
        }

        try {
            const a = document.createElement("a");
            a.href = fileUrl;
            a.download = fileName || "document";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
            // Fallback: open in new window
            window.open(fileUrl, "_blank");
        }
    };

    if (!fileUrl) {
        return (
            <div className="md:hidden bg-red-900/20 border border-red-600/50 p-6 rounded-lg text-center space-y-4">
                <div className="text-4xl">
                    <AlertCircle size={40} className="mx-auto text-red-500" />
                </div>
                <div>
                    <p className="text-white font-bold mb-2">عذراً</p>
                    <p className="text-white/60 text-sm">الملف غير متوفر حالياً</p>
                </div>
            </div>
        );
    }

    // If fileUrl is already an absolute URL (Supabase), use it directly
    // Otherwise, route through local API endpoint
    let iframeUrl = fileUrl;
    if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
        const filename = fileUrl.split('/').pop() || '';
        const isDocument = fileUrl.includes('/documents/');
        const endpoint = isDocument ? '/api/documents/view' : '/api/files/view';
        iframeUrl = `${endpoint}?file=${encodeURIComponent(filename)}`;
    }

    return (
        <>
            {/* Desktop View - iframe */}
            <div className="hidden md:block w-full bg-black border border-brand-yellow/20 rounded-lg overflow-visible">
                <div className="relative w-full h-[700px] overflow-hidden">
                    <iframe
                        src={`${iframeUrl}#toolbar=1&navpanes=0`}
                        className="absolute inset-0 w-full h-full border-0"
                        title={fileName}
                    />
                </div>
            </div>

            {/* Mobile View - Direct Link */}
            <div className="md:hidden bg-gradient-to-br from-brand-yellow/20 to-black border border-brand-yellow/30 p-6 rounded-lg text-center space-y-4">
                <div className="text-5xl">📄</div>
                <div>
                    <p className="text-white font-bold mb-2">{fileName}</p>
                    <p className="text-white/60 text-sm mb-4">اضغط لفتح الملف في عارض جديد</p>
                </div>
                <button
                    onClick={handleOpenPDF}
                    className="w-full py-3 bg-brand-yellow text-black font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                    <Eye size={18} />
                    عرض الملف 📖
                </button>
                <button
                    onClick={handleDownloadPDF}
                    className="w-full py-3 bg-white/10 border border-white/20 text-white font-bold rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                    <Download size={18} />
                    تحميل الملف ⬇️
                </button>
            </div>
        </>
    );
}
