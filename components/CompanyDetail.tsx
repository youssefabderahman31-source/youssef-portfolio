"use client";

import React, { useState, useEffect } from "react";
import type { Company } from "@/lib/data";
import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, FileText, Eye } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";

interface Props {
    company: Company;
}

export default function CompanyDetail({ company }: Props) {
    const { t, language, dir } = useLanguage();
    const [showHeader, setShowHeader] = useState(true);

    const content = language === "ar" && company.content_ar ? company.content_ar : company.content;
    const description = language === "ar" && company.description_ar ? company.description_ar : company.description;

    return (
        <article className="min-h-screen bg-black pb-20">
            {/* Back Button */}
            {showHeader && (
                <div className="container mx-auto px-6 py-12">
                    <Link
                        href="/portfolio"
                        className="inline-flex items-center text-brand-yellow hover:text-white mb-16 transition-colors gap-2 font-bold"
                    >
                        <ArrowLeft size={16} className={clsx(dir === "rtl" && "rotate-180")} />
                        <span className="uppercase tracking-widest text-xs">{t('nav_portfolio')}</span>
                    </Link>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16 pb-12"
                    >
                        <div className="flex flex-col md:flex-row md:items-center gap-8 mb-8">
                            {/* Logo */}
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white flex items-center justify-center p-4 rounded-lg">
                                <Image src={company.logo} alt={company.name} width={128} height={128} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{company.name}</h1>
                                <p className="text-xl text-brand-yellow font-medium">{description}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* PDF Viewer - ALWAYS VISIBLE, FULL WIDTH */}
            {company.documentFile && company.documentType?.includes("pdf") && (
                <div className="w-full bg-black">
                    <iframe
                        src={`${company.documentFile}#toolbar=1&navpanes=0`}
                        className="w-full"
                        style={{ height: "500px" }}
                        title={company.documentName}
                    />
                </div>
            )}

            {/* Non-PDF Files */}
            {company.documentFile && !company.documentType?.includes("pdf") && (
                <div className="container mx-auto px-6 mb-12">
                    <div className="bg-gradient-to-br from-brand-yellow/10 to-white/5 border border-brand-yellow/30 p-8 rounded-lg text-center">
                        <FileText size={48} className="mx-auto mb-4 text-brand-yellow" />
                        <p className="text-white/70 mb-6">{company.documentName}</p>
                        <a
                            href={company.documentFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-yellow text-black font-bold rounded-lg hover:bg-white transition-colors"
                        >
                            <Eye size={18} />
                            فتح الملف
                        </a>
                    </div>
                </div>
            )}

            {/* Text Content - ALWAYS VISIBLE */}
            {content && (
                <div className="container mx-auto px-6 py-12">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="prose prose-invert max-w-4xl mx-auto text-white/80 text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            )}

            {/* CTA */}
            <div className="container mx-auto px-6 py-20 text-center border-t border-white/10">
                <Link
                    href={`/contact?subject=Interest in ${company.name}`}
                    className="group inline-flex items-center gap-3 bg-white text-black px-10 py-5 font-bold uppercase tracking-wider hover:bg-brand-yellow transition-colors rounded-lg"
                >
                    <span>{t('btn_want_this') || 'Get Started'}</span>
                    <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </article>
    );
}
