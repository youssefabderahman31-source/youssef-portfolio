"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, Variants, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Instagram, Linkedin, ExternalLink } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { SiteContent } from "../lib/content";
import { Company } from "../lib/data";
import Image from "next/image";

interface Props {
    content: SiteContent;
    companies: Company[];
}

const MotionImage = motion(Image);

const DECISION_LAYERS = [
    {
        name: "THINKING",
        nameAr: "التفكير",
        radius: 180,
        speed: 15,
        items: [
            { en: "Meaning", ar: "المعنى", def: "Creates value", defAr: "يخلق القيمة" },
            { en: "Interpretation", ar: "التأويل", def: "Shapes reality", defAr: "يشكل الواقع" },
            { en: "Context", ar: "السياق", def: "Directs focus", defAr: "يوجه التركيز" },
            { en: "Belief", ar: "المعتقد", def: "Drives loyalty", defAr: "يقود الولاء" }
        ],
        size: "text-[10px]",
        opacity: 0.3
    },
    {
        name: "EMOTION",
        nameAr: "العاطفة",
        radius: 280,
        speed: -20,
        items: [
            { en: "Trust", ar: "الثقة", def: "Formed before logic", defAr: "تتشكل قبل المنطق" },
            { en: "Doubt", ar: "الشك", def: "Blocks action", defAr: "يعيق الفعل" },
            { en: "Curiosity", ar: "الفضول", def: "Opens the mind", defAr: "يفتح العقل" },
            { en: "Familiarity", ar: "الألفة", def: "Reduces risk", defAr: "تقلل المخاطر" }
        ],
        size: "text-[12px]",
        opacity: 0.6
    },
    {
        name: "DECISION",
        nameAr: "القرار",
        radius: 380,
        speed: 25,
        items: [
            { en: "Attention", ar: "الانتباه", def: "The first currency", defAr: "العملة الأولى" },
            { en: "Choice", ar: "الخيار", def: "Filters options", defAr: "يصفي الخيارات" },
            { en: "Action", ar: "الفعل", def: "The final step", defAr: "الخطوة الأخيرة" },
            { en: "Decision", ar: "القرار", def: "Feels personal", defAr: "يبدو شخصيًا" }
        ],
        size: "text-[14px]",
        opacity: 1
    }
];

export default function HomePage({ content, companies }: Props) {
    const { language } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredWord, setHoveredWord] = useState<{ en: string, ar: string, def: string, defAr: string } | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const isAr = language === 'ar';

    // Animations
    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const stagger: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    return (
        <div ref={containerRef} className={`relative bg-black text-brand-white selection:bg-brand-yellow selection:text-black font-outfit ${isAr ? 'rtl' : 'ltr'}`}>

            {/* 1. HERO — IDENTITY & POSITIONING */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden px-8 before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:via-transparent before:to-black before:pointer-events-none before:z-[5] md:before:hidden">
                {/* Mobile Hero Background Image */}
                <div className="absolute inset-0 md:hidden overflow-hidden">
                    <MotionImage
                        src={content.hero.image}
                        alt="Youssef Abdelrahman"
                        width={800}
                        height={1200}
                        className="w-full h-full object-cover grayscale brightness-40 opacity-60"
                        priority
                    />
                </div>

                <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-[10]">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="md:col-span-12 lg:col-span-7 z-10 space-y-12"
                    >
                        <div className="space-y-4">
                            <motion.div variants={fadeUp} className="w-32 md:w-40 h-auto">
                                <Image
                                    src="/logo.svg"
                                    alt="Youssef Abdelrahman"
                                    width={160}
                                    height={48}
                                    className="w-full h-auto object-contain brightness-110"
                                    priority
                                />
                            </motion.div>
                            <motion.p variants={fadeUp} className="text-4xl md:text-6xl font-serif font-light tracking-tight leading-tight">
                                {isAr ? "استراتيجي تسويق وكاشف للمعنى" : "Marketing Strategist & Copywriter"}
                            </motion.p>
                        </div>

                        <div className="max-w-xl">
                            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-medium leading-tight text-white/80">
                                {isAr ? (
                                    <>أنا أدرس كيف يفكر الناس فيما تبيعه — <br /><span className="text-brand-yellow italic">ثم أعيد تصميم ذلك التفكير.</span></>
                                ) : (
                                    <>I study how people think about what you sell — <br /><span className="text-brand-yellow italic">then I redesign that thinking.</span></>
                                )}
                            </motion.h2>
                        </div>

                        <motion.div variants={fadeUp} className="flex flex-wrap gap-8 pt-4">
                            <Link href="/portfolio" className="group flex items-center gap-4 text-xs font-bold uppercase tracking-widest bg-brand-yellow text-black px-8 py-4 hover:bg-white transition-colors duration-500">
                                {isAr ? 'استعرض أعمالي' : 'View My Work'}
                                <ArrowRight size={16} className={`group-hover:translate-x-2 transition-transform ${isAr ? 'rotate-180' : ''}`} />
                            </Link>
                            <Link href="/portfolio" className="group flex items-center gap-4 text-xs font-bold uppercase tracking-widest px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:border-brand-yellow hover:bg-white/10 transition-colors duration-500">
                                {isAr ? 'الأعمال' : 'Work'}
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                        className="hidden lg:block lg:col-span-5 relative aspect-[4/5] overflow-hidden rounded-sm"
                    >
                        <MotionImage
                            src={content.hero.image}
                            alt="Youssef Abdelrahman"
                            width={800}
                            height={1200}
                            className="w-full h-full object-cover grayscale brightness-75 transition-all duration-1000"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
                    </motion.div>
                </div>
            </section>

            {/* 2. PHILOSOPHY SECTION */}
            <section className="relative py-40 px-8 border-y border-white/5">
                <div className="container mx-auto max-w-4xl text-center space-y-24">
                    <div className="space-y-8">
                        <motion.h2
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="text-4xl md:text-7xl font-serif leading-tight"
                        >
                            {isAr ? "معظم المنتجات لا تفشل." : "Most products don't fail."} <br />
                            <span className="text-white/30">{isAr ? "تأويلها هو ما يفشل." : "Their interpretation does."}</span>
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12">
                        {[
                            { en: "The message is unclear", ar: "الرسالة غير واضحة" },
                            { en: "The language doesn't match the market", ar: "اللغة لا تناسب السوق" },
                            { en: "Trust is missing", ar: "الثقة مفقودة" }
                        ].map((point, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: idx * 0.2 }}
                                className="space-y-4"
                            >
                                <div className="w-8 h-[1px] bg-brand-yellow mx-auto" />
                                <p className="text-sm font-bold uppercase tracking-widest text-white/60">{isAr ? point.ar : point.en}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. WHAT I CHANGE */}
            <section className="relative py-40 px-8 bg-neutral-950/20">
                <div className="container mx-auto">
                    <div className="text-center mb-32 space-y-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-yellow">{isAr ? "ما الذي أغيره" : "What I Change"}</span>
                        <h2 className="text-4xl md:text-6xl font-serif italic">{isAr ? "إعادة صياغة الحضور" : "The Core Transformation"}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
                        {[
                            { titleEn: "The Message", titleAr: "الرسالة", descEn: "I remove confusion.", descAr: "أزيل التشتت والارتباك." },
                            { titleEn: "The Angle", titleAr: "الزاوية", descEn: "I reposition value.", descAr: "أعيد تموضع القيمة." },
                            { titleEn: "The Language", titleAr: "اللغة", descEn: "I rewrite how brands speak.", descAr: "أعيد كتابة طريقة حديث العلامات." },
                            { titleEn: "The Perception", titleAr: "الإدراك", descEn: "I shape what people feel before deciding.", descAr: "أشكل ما يشعر به الناس قبل اتخاذ القرار." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-black p-12 space-y-8 hover:bg-neutral-900 transition-colors duration-700 group">
                                <span className="text-[10px] font-bold text-brand-yellow/40 group-hover:text-brand-yellow">0{idx + 1}</span>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold tracking-tight">{isAr ? item.titleAr : item.titleEn}</h3>
                                    <p className="text-sm text-white/50 leading-relaxed font-light">{isAr ? item.descAr : item.descEn}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. SELECTED WORKS (LINKED) */}
            <section className="relative py-40 px-8">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-yellow">{isAr ? "أعمال مختارة" : "Selected Works"}</span>
                            <h2 className="text-4xl md:text-6xl font-serif tracking-tighter italic">{isAr ? "العمل هو الدليل." : "Work is evidence."}</h2>
                        </div>
                        <Link href="/portfolio" className="group flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-brand-yellow transition-colors duration-500">
                            {isAr ? 'استكشف الأعمال' : 'Explore Work'} <ArrowRight size={14} className={isAr ? 'rotate-180' : ''} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {companies.slice(0, 3).map((project: Company, idx: number) => (
                            <Link key={idx} href={`/portfolio/${project.slug}`} className="group relative block aspect-[4/5] bg-neutral-900 overflow-hidden rounded-sm">
                                {project.logo ? (
                                    <Image src={project.logo} alt={project.name} width={600} height={800} className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-12">
                                        <span className="text-2xl font-bold tracking-tighter opacity-10">{project.name}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-12 flex flex-col justify-end">
                                    <h4 className="text-xl font-bold tracking-tight mb-2">{isAr ? project.name : project.name}</h4>
                                    <p className="text-xs text-white/40 group-hover:text-brand-yellow transition-colors">{isAr ? project.description_ar : project.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. SOCIAL PRESENCE */}
            <section className="relative py-40 px-8 border-t border-white/5">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-serif italic text-white/80">
                                {isAr ? "حيث يستمر تفكيري." : "Where my thinking continues."}
                            </h2>
                            <p className="text-white/40 max-w-sm leading-relaxed text-sm">
                                {isAr ? "الأفكار لا تتوقف عند المواقع الإلكترونية. إنها تنتقل حيث يتصفح الناس." : "Ideas don't stop on websites. They move where people scroll."}
                            </p>
                        </div>
                        <div className="flex gap-12 justify-center md:justify-end">
                            <a href="https://linkedin.com/in/youssefabdelrahman" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4 transition-colors">
                                <div className="p-6 rounded-full border border-white/5 group-hover:border-brand-yellow transition-colors duration-500">
                                    <Linkedin className="w-6 h-6 text-white/20 group-hover:text-brand-yellow" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white">LinkedIn</span>
                            </a>
                            <a href="https://instagram.com/youssefabdelrahman" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4 transition-colors">
                                <div className="p-6 rounded-full border border-white/5 group-hover:border-brand-yellow transition-colors duration-500">
                                    <Instagram className="w-6 h-6 text-white/20 group-hover:text-brand-yellow" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white">Instagram</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. FINAL CTA */}
            <section className="relative py-60 px-8 bg-black flex flex-col items-center text-center overflow-hidden">
                {/* Visual Flair */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-brand-yellow to-transparent" />

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="space-y-16 max-w-4xl z-10"
                >
                    <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-serif italic leading-tight text-white/90">
                        {isAr ?
                            "إذا كان منتجك ممتازاً ولكنه يساء فهمه، فهنا يأتي دوري." :
                            "If your product is good but misunderstood, that's where I come in."
                        }
                    </motion.h2>

                    <motion.div variants={fadeUp} className="pt-8">
                        <Link href="/contact" className="group relative inline-flex items-center gap-8 bg-brand-yellow text-black px-12 py-6 font-bold uppercase tracking-[0.3em] text-sm hover:bg-white transition-colors duration-700">
                            {isAr ? 'ابدأ المحادثة' : 'Start a Conversation'}
                            <ArrowRight size={20} className={`group-hover:translate-x-4 transition-transform ${isAr ? 'rotate-180' : ''}`} />
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Ambient Glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-yellow/5 blur-[100px] rounded-full" />
            </section>

        </div>
    );
}
