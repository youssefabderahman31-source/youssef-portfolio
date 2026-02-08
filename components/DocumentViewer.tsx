"use client";

import React, { useState } from "react";
import { Download, Eye, FileText, AlertCircle, FileIcon, ChevronDown, ChevronUp } from "lucide-react";

interface DocumentViewerProps {
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
}

export default function DocumentViewer({ fileUrl, fileName, fileType }: DocumentViewerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenDocument = async () => {
        if (!fileUrl) {
            alert("عذراً، رابط الملف غير متوفر");
            return;
        }

        try {
            setIsLoading(true);
            // Extract filename from URL
            const filename = fileUrl.split('/').pop() || 'document';
            
            // Determine which API endpoint to use based on the URL path
            const isDocument = fileUrl.includes('/documents/');
            const endpoint = isDocument ? '/api/documents/view' : '/api/files/view';
            const apiUrl = `${endpoint}?file=${encodeURIComponent(filename)}`;
            
            // Open in new window
            const newWindow = window.open(apiUrl, "_blank", "width=1024, height=768");
            
            if (!newWindow) {
                alert("تم حظر النافذة المنبثقة. حاول مرة أخرى.");
            }
        } catch (error) {
            console.error("Error opening document:", error);
            alert("حدث خطأ أثناء فتح الملف");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadDocument = async () => {
        if (!fileUrl) {
            alert("عذراً، رابط الملف غير متوفر");
            return;
        }

        try {
            setIsLoading(true);
            
            // Try fetch first
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error("Failed to download file");
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = fileName || "document";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Download error:", error);
            // Fallback: direct link download
            const a = document.createElement("a");
            a.href = fileUrl;
            a.download = fileName || "document";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } finally {
            setIsLoading(false);
        }
    };

    const getFileIcon = (type?: string): { icon: string; color: string; label: string } => {
        if (!type) return { icon: "📄", color: "from-gray-500 to-gray-700", label: "ملف" };
        if (type.includes("pdf")) return { icon: "📕", color: "from-red-500 to-red-700", label: "PDF" };
        if (type.includes("word") || type.includes("document")) return { icon: "📘", color: "from-blue-500 to-blue-700", label: "مستند Word" };
        if (type.includes("excel") || type.includes("spreadsheet")) return { icon: "📗", color: "from-green-500 to-green-700", label: "جدول Excel" };
        if (type.includes("powerpoint") || type.includes("presentation")) return { icon: "📙", color: "from-orange-500 to-orange-700", label: "عرض PowerPoint" };
        return { icon: "📎", color: "from-gray-500 to-gray-700", label: "ملف" };
    };

    const fileInfo = getFileIcon(fileType);

    if (!fileUrl) {
        return (
            <div className="w-full bg-red-900/20 border border-red-600/50 p-6 rounded-lg text-center space-y-4">
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

    return (
        <>
            {/* Desktop View - iframe */}
            <div className="hidden md:block w-full bg-black border border-brand-yellow/20 rounded-lg overflow-visible">
                <div className="relative w-full h-[700px] overflow-hidden">
                    <iframe
                        src={`${fileUrl}#toolbar=1&navpanes=0`}
                        className="absolute inset-0 w-full h-full border-0"
                        title={fileName}
                    />
                </div>
            </div>

            {/* Mobile View - Custom Document Viewer */}
            <div className="md:hidden space-y-4">
                {/* Document Card */}
                <div className={`bg-gradient-to-br ${fileInfo.color} p-1 rounded-lg`}>
                    <div className="bg-black/90 p-6 rounded-lg space-y-4">
                        {/* File Icon and Info */}
                        <div className="flex items-start gap-4">
                            <div className="text-5xl flex-shrink-0">{fileInfo.icon}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-brand-yellow uppercase tracking-widest mb-1">
                                    {fileInfo.label}
                                </p>
                                <p className="text-white font-bold text-lg break-words mb-1">{fileName}</p>
                                <p className="text-white/50 text-xs">اضغط لعرض أو تحميل الملف</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                            <button
                                onClick={handleOpenDocument}
                                disabled={isLoading}
                                className="w-full py-3 bg-gradient-to-r from-brand-yellow to-yellow-400 text-black font-bold rounded-lg hover:from-white hover:to-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        جاري التحميل...
                                    </>
                                ) : (
                                    <>
                                        <Eye size={18} />
                                        عرض الملف
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleDownloadDocument}
                                disabled={isLoading}
                                className="w-full py-3 bg-white/10 border border-brand-yellow/50 text-white font-bold rounded-lg hover:bg-white/20 hover:border-brand-yellow transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        جاري التحميل...
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        تحميل الملف
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Expandable Details */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full py-2 flex items-center justify-between text-white/60 hover:text-white transition-colors text-sm"
                        >
                            <span>معلومات الملف</span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {isExpanded && (
                            <div className="bg-white/5 border border-white/10 p-4 rounded space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-white/60">نوع الملف:</span>
                                    <span className="text-white font-bold">{fileType || 'غير معروف'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">الحالة:</span>
                                    <span className="text-green-400 font-bold">متوفر ✓</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">يدعم:</span>
                                    <span className="text-white font-bold">التحميل المباشر</span>
                                </div>
                            </div>
                        )}

                        {/* Helpful Tips */}
                        <div className="bg-brand-yellow/10 border border-brand-yellow/20 p-3 rounded text-xs text-white/80 space-y-1">
                            <p className="font-bold text-brand-yellow">💡 نصيحة:</p>
                            <p>إذا لم يفتح الملف، جرّب تحميله أولاً ثم افتحه من تطبيق القراءة.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
