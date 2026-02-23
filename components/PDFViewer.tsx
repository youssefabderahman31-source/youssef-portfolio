"use client";

import { Download, Eye, FileText, AlertCircle } from "lucide-react";

interface PDFViewerProps {
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    fileUrlAr?: string;
    fileNameAr?: string;
    fileTypeAr?: string;
}

export default function PDFViewer({ fileUrl, fileName, fileType, fileUrlAr, fileNameAr, fileTypeAr }: PDFViewerProps) {
    const [chosenUrl, setChosenUrl] = React.useState<string | undefined>(fileUrl);
    const [chosenName, setChosenName] = React.useState<string | undefined>(fileName);
    const [chosenType, setChosenType] = React.useState<string | undefined>(fileType);

    React.useEffect(() => {
        try {
            const lang = (navigator.language || (navigator as any).userLanguage || 'en').startsWith('ar') ? 'ar' : 'en';
            if (lang === 'ar' && fileUrlAr) {
                setChosenUrl(fileUrlAr);
                setChosenName(fileNameAr || fileName);
                setChosenType(fileTypeAr || fileType);
                return;
            }
        } catch (e) {
            // ignore
        }
        setChosenUrl(fileUrl);
        setChosenName(fileName);
        setChosenType(fileType);
    }, [fileUrl, fileUrlAr, fileName, fileNameAr, fileType, fileTypeAr]);

    const handleOpenPDF = () => {
        if (!chosenUrl) {
            alert("عذراً، رابط الملف غير متوفر");
            return;
        }

        if (chosenUrl.startsWith('http://') || chosenUrl.startsWith('https://')) {
            window.open(chosenUrl, "_blank");
            return;
        }

        const filename = chosenUrl.split('/').pop() || 'document';
        const isDocument = chosenUrl.includes('/documents/');
        const endpoint = isDocument ? '/api/documents/view' : '/api/files/view';
        const apiUrl = `${endpoint}?file=${encodeURIComponent(filename)}`;

        window.open(apiUrl, "_blank");
    };

    const handleDownloadPDF = () => {
        if (!chosenUrl) {
            alert("عذراً، رابط الملف غير متوفر");
            return;
        }

        try {
            const a = document.createElement("a");
            a.href = chosenUrl;
            a.download = chosenName || "document";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
            window.open(chosenUrl, "_blank");
        }
    };

    if (!chosenUrl) {
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

    let iframeUrl = chosenUrl;
    if (!chosenUrl.startsWith('http://') && !chosenUrl.startsWith('https://')) {
        const filename = chosenUrl.split('/').pop() || '';
        const isDocument = chosenUrl.includes('/documents/');
        const endpoint = isDocument ? '/api/documents/view' : '/api/files/view';
        iframeUrl = `${endpoint}?file=${encodeURIComponent(filename)}`;
    }

    return (
        <>
            <div className="hidden md:block w-full bg-black border border-brand-yellow/20 rounded-lg overflow-visible">
                <div className="relative w-full h-[700px] overflow-hidden">
                    <iframe
                        src={`${iframeUrl}#toolbar=1&navpanes=0`}
                        className="absolute inset-0 w-full h-full border-0"
                        title={chosenName}
                    />
                </div>
            </div>

            <div className="md:hidden bg-gradient-to-br from-brand-yellow/20 to-black border border-brand-yellow/30 p-6 rounded-lg text-center space-y-4">
                <div className="text-5xl">📄</div>
                <div>
                    <p className="text-white font-bold mb-2">{chosenName}</p>
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
