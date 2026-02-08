"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import { Send, Twitter, Linkedin, Instagram } from "lucide-react";

export default function ContactForm() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
    const messageRef = React.useRef<string>("");

    React.useEffect(() => {
        const subject = searchParams.get("subject");
        if (subject) {
            const newMessage = `Hi Youssef, \n\n${subject}...`;
            if (messageRef.current !== newMessage) {
                messageRef.current = newMessage;
                setFormData(prev => ({ ...prev, message: newMessage }));
            }
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Editorial Side */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
            >
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-brand-yellow mb-2">Socials</h2>
                    <div className="flex gap-4">
                        <a href="#" aria-label="Twitter" className="p-3 bg-white/5 hover:bg-white hover:text-black transition-colors rounded-full"><Twitter size={20} /></a>
                        <a href="https://www.linkedin.com/in/youssef-abderahman-90a23a301?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-3 bg-white/5 hover:bg-white hover:text-black transition-colors rounded-full"><Linkedin size={20} /></a>
                        <a href="https://www.instagram.com/youssef_abdrahman7?igsh=MWtkZWx6YjVmdnVleA==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-3 bg-white/5 hover:bg-white hover:text-black transition-colors rounded-full"><Instagram size={20} /></a>
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-brand-yellow mb-2">Direct</h2>
                    <p className="text-3xl font-bold text-white">youssefabderahman31@gmail.com</p>
                </div>
            </motion.div>

            {/* Form Side */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">{t('form_name')}</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-transparent border-b border-white/20 py-4 text-xl focus:outline-none focus:border-brand-yellow transition-colors"
                            placeholder="Jane Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">{t('form_email')}</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-transparent border-b border-white/20 py-4 text-xl focus:outline-none focus:border-brand-yellow transition-colors"
                            placeholder="jane@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">{t('form_message')}</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                            className="w-full bg-transparent border-b border-white/20 py-4 text-xl focus:outline-none focus:border-brand-yellow transition-colors resize-none"
                            placeholder="Tell me about your brand..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status !== "idle"}
                        className="w-full py-5 bg-white text-black font-bold uppercase tracking-wider hover:bg-brand-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {status === "submitting" ? t('form_sending') : status === "success" ? t('form_sent') : t('form_submit')}
                        {status === "idle" && <Send size={18} />}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
