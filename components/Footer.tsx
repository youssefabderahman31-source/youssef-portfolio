"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function Footer() {
    const { t, language } = useLanguage();
    const currentYear = new Date().getFullYear();
    const isAr = language === 'ar';

    return (
        <footer className="bg-black border-t border-white/5 py-24">
            <div className="container mx-auto px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold uppercase tracking-[0.3em]">{t('footer_copy')}</h3>
                        <p className="text-sm font-light text-brand-yellow tracking-widest uppercase">
                            {t('footer_crafted')}
                        </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-4">
                        <p className="text-[10px] text-white/20 uppercase tracking-[0.5em]">
                            &copy; {currentYear} {t('footer_copy')}
                        </p>
                        <div className="h-[1px] w-12 bg-white/10" />
                    </div>
                </div>
            </div>
        </footer>
    );
}

