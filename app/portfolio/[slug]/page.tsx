import React from "react";
import { getCompany, getProjectsByCompany } from "@/lib/data";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Send, Download, FileText, Eye } from "lucide-react";
import PDFViewer from "@/components/PDFViewer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const company = await getCompany(slug);
    if (!company) return { title: "Not Found" };
    return {
        title: `${company.name} | Youssef Abderahman`,
        description: company.description,
    };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const company = await getCompany(slug);

    if (!company) {
        notFound();
    }

    // Get all projects for this company
    const projects = await getProjectsByCompany(company.id);

    const getFileIcon = (type?: string) => {
        if (!type) return "📄";
        if (type.includes("pdf")) return "📄";
        if (type.includes("word") || type.includes("document")) return "📝";
        if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
        if (type.includes("powerpoint") || type.includes("presentation")) return "🎯";
        return "📎";
    };

    return (
        <article className="min-h-screen pb-20 overflow-visible">
            <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl overflow-visible">
                {/* Back Link */}
                <Link
                    href="/portfolio"
                    className="inline-flex items-center text-brand-yellow hover:text-white mb-6 md:mb-8 transition-colors gap-2 font-bold text-xs md:text-sm"
                >
                    <ArrowLeft size={16} />
                    <span className="uppercase tracking-widest">←  Back to Portfolio</span>
                </Link>

                {/* Header */}
                <div className="mb-12 md:mb-16 border-b border-white/10 pb-8 md:pb-12">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 mb-8">
                        {/* Logo */}
                        <div className="w-20 h-20 md:w-32 md:h-32 bg-white flex items-center justify-center p-3 md:p-4 rounded-lg flex-shrink-0">
                            <Image
                                src={company.logo}
                                alt={company.name}
                                width={128}
                                height={128}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-6xl font-bold text-white mb-2">{company.name}</h1>
                            <p className="text-base md:text-xl text-brand-yellow font-medium">{company.description}</p>
                        </div>
                    </div>
                </div>

                {/* Projects/Works */}
                {projects.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 p-6 md:p-12 rounded-lg text-center">
                        <p className="text-white/60 mb-4">لا توجد مشاريع مرتبطة بهذه الشركة حالياً</p>
                    </div>
                ) : (
                    <div className="space-y-12 md:space-y-16 overflow-visible">
                        {projects.map((project, index) => (
                            <div key={project.id} className="mb-8 md:mb-12 overflow-visible w-full">
                                {/* Project Title */}
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{project.name}</h2>
                                <p className="text-base md:text-lg text-brand-yellow font-medium mb-6">{project.description}</p>

                                {/* Document Section */}
                                {project.documentFile && (
                                    <div className="space-y-4 md:space-y-6 w-full overflow-visible">
                                        {/* Document Header Card */}
                                        <div className="bg-gradient-to-r from-brand-yellow/10 to-black border border-brand-yellow/30 rounded-lg p-4 md:p-6">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <div className="text-3xl md:text-4xl">{getFileIcon(project.documentType)}</div>
                                                    <div>
                                                        <p className="text-xs md:text-sm text-brand-yellow font-bold uppercase">📎 مستند العمل</p>
                                                        <p className="text-base md:text-lg font-bold text-white line-clamp-2">{project.documentName}</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={project.documentFile}
                                                    download
                                                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-brand-yellow text-black font-bold text-sm md:text-base rounded-lg hover:bg-white transition-colors whitespace-nowrap"
                                                >
                                                    <Download size={16} />
                                                    تحميل
                                                </a>
                                            </div>
                                        </div>

                                        {/* PDF Viewer for PDF files */}
                                        {project.documentType?.includes("pdf") && (
                                            <PDFViewer 
                                                fileUrl={project.documentFile}
                                                fileName={project.documentName}
                                                fileType={project.documentType}
                                            />
                                        )}

                                        {/* For non-PDF files */}
                                        {!project.documentType?.includes("pdf") && (
                                            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-lg text-center">
                                                <FileText size={36} className="mx-auto mb-3 md:mb-4 text-brand-yellow" />
                                                <p className="text-white/60 mb-4 text-sm md:text-base">
                                                    لا يمكن عرض معاينة لهذا النوع من الملفات مباشرة
                                                </p>
                                                <a
                                                    href={project.documentFile}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-bold text-sm md:text-base rounded-lg hover:bg-white transition-colors"
                                                >
                                                    <Eye size={18} />
                                                    فتح الملف
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Divider between projects */}
                                {index < projects.length - 1 && (
                                    <div className="mt-16 pt-12 border-t border-white/10" />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-16 md:mt-20 pt-8 md:pt-12 border-t border-white/10 flex justify-center">
                    <Link
                        href={`/contact?subject=Interest in ${company.name} style`}
                        className="group flex items-center gap-2 md:gap-3 bg-white text-black px-6 md:px-10 py-4 md:py-5 font-bold text-sm md:text-base uppercase tracking-wider hover:bg-brand-yellow transition-colors rounded-lg"
                    >
                        <span>هل تريد هذا المستوى من الخدمة؟</span>
                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
