"use client";

import React, { useState } from "react";
import { Company } from "@/lib/data";
import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Expand, Minimize } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";

interface Props {
    company: Company;
}

export default function CompanyDetail({ company }: Props) {
    const { t, language, dir } = useLanguage();
    const [isFocusMode, setIsFocusMode] = useState(false);

    const content = language === "ar" && company.content_ar ? company.content_ar : company.content;
    const description = language === "ar" && company.description_ar ? company.description_ar : company.description;

    return (
        <article className={clsx("min-h-screen transition-colors duration-500", isFocusMode ? "bg-black py-20" : "pb-20")}>

            {/* Focus Mode Toggle (Fixed) */}
            <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className="fixed bottom-8 right-8 z-50 p-4 bg-white/10 hover:bg-brand-yellow hover:text-black rounded-full backdrop-blur transition-colors"
                title="Toggle Focus Mode"
            >
                {isFocusMode ? <Minimize size={20} /> : <Expand size={20} />}
            </button>

            <div className={clsx("container mx-auto px-6 py-12 transition-all duration-500", isFocusMode && "max-w-3xl")}>

                {/* Breadcrumb / Back - Hidden in Focus Mode */}
                <AnimatePresence>
                    {!isFocusMode && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Link
                                href="/portfolio"
                                className="inline-flex items-center text-gray-500 hover:text-white mb-8 transition-colors gap-2"
                            >
                                <ArrowLeft size={16} className={clsx(dir === "rtl" && "rotate-180")} />
                                <span className="uppercase tracking-widest text-xs font-bold">{t('nav_portfolio')}</span>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <AnimatePresence>
                    {!isFocusMode && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                            className="mb-16 border-b border-white/10 pb-12"
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-8 mb-8">
                                {/* Logo */}
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-white flex items-center justify-center p-4">
                                    <Image src={company.logo} alt={company.name} width={128} height={128} className="max-w-full max-h-full object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{company.name}</h1>
                                    <p className="text-xl text-brand-yellow font-medium">{description}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content */}
                <motion.div
                    layout
                    className="prose prose-invert prose-lg max-w-4xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: content }}
                />

                {/* CTA - Hidden in Focus Mode unless scrolled to bottom? Or keep visible? Let's hide to be pure 'reading' */}
                <AnimatePresence>
                    {!isFocusMode && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-20 pt-12 border-t border-white/10 flex justify-center"
                        >
                            <Link
                                href={`/contact?subject=Interest in ${company.name} style`}
                                className="group flex items-center gap-3 bg-white text-black px-10 py-5 font-bold uppercase tracking-wider hover:bg-brand-yellow transition-colors"
                            >
                                <span>{t('btn_want_this')}</span>
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform rtl:group-hover:-translate-x-1" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </article>
    );
}
