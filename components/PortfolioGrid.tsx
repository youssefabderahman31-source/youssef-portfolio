"use client";

import React from "react";
import Link from "next/link";
import { Company } from "@/lib/data";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

interface Props {
    companies: Company[];
}

export default function PortfolioGrid({ companies }: Props) {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16 border-b border-white/10 pb-8"
            >
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{t('nav_portfolio')}</h1>
                <p className="text-xl text-gray-400 max-w-2xl">{t('portfolio_intro')}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {companies.map((company, index) => (
                    <Link href={`/portfolio/${company.slug}`} key={company.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative aspect-square bg-neutral-900 border border-white/5 overflow-hidden flex flex-col justify-between p-8 hover:border-brand-yellow/50 transition-colors"
                        >
                            {/* Logo Area */}
                            <div className="flex-grow flex items-center justify-center p-8">
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {/* Fallback to text if logo fails or use img */}
                                    <Image
                                        src={company.logo}
                                        alt={company.name}
                                        fill
                                        className="object-contain opacity-70 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-500 scale-95 group-hover:scale-105"
                                    />
                                </div>
                            </div>

                            {/* Overlay/Footer details */}
                            <div className="mt-4">
                                <div className="flex justify-between items-end border-t border-white/10 pt-4 group-hover:border-brand-yellow/30 transition-colors">
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-brand-yellow transition-colors">{company.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider truncate max-w-[200px]">{company.description}</p>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-full group-hover:bg-brand-yellow group-hover:text-black transition-colors">
                                        <ArrowUpRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
