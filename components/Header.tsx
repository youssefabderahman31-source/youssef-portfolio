"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/components/LanguageContext";
import clsx from "clsx";

export default function Header() {
    const { t, language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { scrollY } = useScroll();

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        return scrollY.on("change", (latest) => {
            setIsScrolled(latest > 20);
        });
    }, [scrollY]);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
                router.push('/admin');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    const navItems = [
        { name: "nav_home", path: "/" },
        { name: "nav_about", path: "/about" },
        { name: "nav_portfolio", path: "/portfolio" },
        { name: "nav_contact", path: "/contact" },
    ];

    const isAr = language === 'ar';

    return (
        <motion.header
            className={clsx(
                "fixed top-0 left-0 right-0 z-[100] transition-all duration-700",
                isScrolled
                    ? "bg-black/80 backdrop-blur-xl py-4 border-b border-white/5 shadow-2xl"
                    : "bg-transparent py-8 border-b border-transparent"
            )}
        >
            <div className="container mx-auto px-8 md:px-12 flex justify-between items-center">

                {/* Logo Section */}
                <Link href="/" className="group flex items-center gap-3" onClick={closeMenu}>
                    <Image
                        src="/logo.png"
                        alt="Youssef Abderahman Logo"
                        width={120}
                        height={48}
                        className={clsx(
                            "transition-all duration-700 object-contain w-auto",
                            isScrolled ? "h-6" : "h-12"
                        )}
                        priority
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className={clsx(
                    "hidden md:flex items-center space-x-16",
                    isAr ? "flex-row-reverse space-x-reverse" : "flex-row"
                )}>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={clsx(
                                "text-[9px] font-bold uppercase tracking-[0.4em] transition-all duration-700 relative group py-2",
                                pathname === item.path ? "text-brand-yellow font-black" : "text-white/30 hover:text-white"
                            )}
                        >
                            {t(item.name)}
                            <span className={clsx(
                                "absolute -bottom-1 left-1/2 -translate-x-1/2 h-[1px] bg-brand-yellow transition-all duration-700 ease-in-out",
                                pathname === item.path ? "w-full" : "w-0 group-hover:w-full"
                            )} />
                        </Link>
                    ))}

                    {/* Language Toggle */}
                    <div className={clsx(
                        "flex items-center gap-6 border-l border-white/10 pl-16",
                        isAr && "border-l-0 border-r pr-16 pl-0 flex-row-reverse"
                    )}>
                        <button
                            onClick={() => setLanguage(isAr ? "en" : "ar")}
                            aria-label="Toggle language"
                            className="text-[9px] font-bold uppercase tracking-[0.5em] bg-white/5 text-white px-4 py-2 rounded-full border border-white/20 hover:bg-brand-yellow hover:text-black hover:border-brand-yellow transition-all duration-300"
                        >
                            {isAr ? "EN" : "AR"}
                        </button>
                    </div>
                </nav>


                {/* Mobile Trigger */}
                <button
                    className="md:hidden text-white/50 hover:text-white transition-colors"
                    onClick={toggleMenu}
                >
                    <div className="space-y-1.5 p-2 group">
                        <div className={clsx("h-[1px] bg-current transition-all duration-500", isOpen ? "w-6 rotate-45 translate-y-1" : "w-6")} />
                        <div className={clsx("h-[1px] bg-current transition-all duration-500", isOpen ? "w-6 -rotate-45 -translate-y-1" : "w-4")} />
                    </div>
                </button>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: isAr ? "-100%" : "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isAr ? "-100%" : "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 bg-black/80 z-[90] md:hidden flex"
                        onClick={closeMenu}
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Clickable overlay area to close menu */}
                        <div className="flex-1" />

                        {/* Menu panel */}
                        <div className="w-10/12 max-w-xs bg-black p-8 flex flex-col justify-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end mb-6">
                                <button onClick={closeMenu} aria-label="Close menu" className="text-white/50 hover:text-white">
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-8">
                                {navItems.map((item, idx) => (
                                    <motion.div
                                        key={item.path}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 * idx }}
                                    >
                                        <Link
                                            href={item.path}
                                            onClick={closeMenu}
                                            className={clsx(
                                                "text-3xl font-serif font-bold tracking-tight block",
                                                pathname === item.path ? "text-gold" : "text-white/60"
                                            )}
                                        >
                                            {t(item.name)}
                                        </Link>
                                    </motion.div>
                                ))}

                                <div className="pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => { setLanguage(isAr ? "en" : "ar"); closeMenu(); }}
                                        className="w-full text-sm font-bold uppercase tracking-[0.4em] bg-gradient-to-r from-brand-yellow to-yellow-400 text-black px-4 py-3 rounded-lg shadow-2xl hover:shadow-brand-yellow/50 transition-all duration-300"
                                    >
                                        {isAr ? "🇬🇧 English" : "🇸🇦 العربية"}
                                    </button>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-3">© 2026</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
