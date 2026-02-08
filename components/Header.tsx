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
                        src="/logo.svg"
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
                            className="text-[9px] font-bold uppercase tracking-[0.5em] bg-white/10 text-white px-3 py-2 rounded-full border border-white/10 hover:bg-brand-yellow hover:text-black transition-colors duration-300"
                        >
                            {isAr ? "English" : "العربية"}
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
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 bg-black z-[90] md:hidden flex flex-col justify-center px-12"
                    >
                        <div className="space-y-12">
                            {navItems.map((item, idx) => (
                                <motion.div
                                    key={item.path}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                >
                                    <Link
                                        href={item.path}
                                        onClick={closeMenu}
                                        className={clsx(
                                            "text-5xl font-serif font-bold tracking-tighter block",
                                            pathname === item.path ? "text-gold" : "text-white/20 italic"
                                        )}
                                    >
                                        {t(item.name)}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <div className="absolute bottom-20 left-12 right-12 flex justify-between items-center border-t border-white/5 pt-12">
                            <button
                                onClick={() => { setLanguage(isAr ? "en" : "ar"); closeMenu(); }}
                                className="text-xs font-bold uppercase tracking-[0.5em] bg-brand-yellow text-black px-4 py-3 rounded-md shadow-lg"
                            >
                                {isAr ? "Switch to English" : "اللغة العربية"}
                            </button>
                            <span className="text-[10px] text-white/10 uppercase tracking-widest">© 2026</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
