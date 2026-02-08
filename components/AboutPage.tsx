"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import { SiteContent } from "../lib/content";

export default function About({ content }: { content: SiteContent }) {
    const { t, language } = useLanguage();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const sectionVariant = {
        hidden: { y: 30, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { duration: 0.6 } }
    };

    return (
        <div className="container mx-auto px-6 py-20 min-h-screen">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-3xl mx-auto space-y-20"
            >
                <motion.div variants={sectionVariant} className="text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">{t('nav_about')}</h1>
                    <div className="w-20 h-1 bg-brand-yellow mx-auto"></div>
                </motion.div>

                {/* Who I Am */}
                <motion.div variants={sectionVariant} className="prose prose-invert prose-lg">
                    <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-brand-yellow pl-4">
                        {language === 'ar' ? content?.about?.who_title_ar : content?.about?.who_title_en}
                    </h2>
                    <p className="text-xl leading-relaxed text-gray-300">
                        {language === 'ar' ? content?.about?.who_text_ar : content?.about?.who_text_en}
                    </p>
                </motion.div>

                {/* How I Think */}
                <motion.div variants={sectionVariant} className="prose prose-invert prose-lg">
                    <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-brand-yellow pl-4">
                        {language === 'ar' ? content?.about?.think_title_ar : content?.about?.think_title_en}
                    </h2>
                    <p className="text-2xl font-serif italic text-brand-yellow/80 mb-6">
                        &quot;{language === 'ar' ? content?.about?.think_text_ar : content?.about?.think_text_en}&quot;
                    </p>
                </motion.div>

                {/* What I Do */}
                <motion.div variants={sectionVariant} className="prose prose-invert prose-lg">
                    <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-brand-yellow pl-4">
                        {language === 'ar' ? content?.about?.do_title_ar : content?.about?.do_title_en}
                    </h2>
                    <p className="text-gray-300 mb-4">
                        {language === 'ar' ? content?.about?.do_text_ar : content?.about?.do_text_en}
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
