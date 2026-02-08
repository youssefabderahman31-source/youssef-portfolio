"use client";

import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";

interface SiteContent {
    hero: { [key: string]: string | string[] };
    why_me: { [key: string]: string | string[] };
    philosophy: { [key: string]: string | string[] };
    credibility: { [key: string]: string | string[] };
    social: { [key: string]: string | string[] };
    contact: { [key: string]: string | string[] };
    what_i_design: { [key: string]: string | string[] };
    about: { [key: string]: string | string[] };
    final_cta: { [key: string]: string | string[] };
}

export default function ContentEditor() {
    const [content, setContent] = useState<SiteContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [activeSection, setActiveSection] = useState<string>("hero");

    const fetchContent = async () => {
        try {
            const res = await fetch("/api/content");
            const data = await res.json();
            setContent(data);
            setLoading(false);
        } catch (_error) {
            console.error("Error fetching content:", _error);
            setLoading(false);
        }
    };

    // This pattern is acceptable for data fetching in effects
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchContent();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        try {
            const res = await fetch("/api/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(content),
            });

            if (res.ok) {
                setMessage("✅ Content saved successfully!");
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage("❌ Failed to save content");
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            setMessage("❌ Error saving content");
        }
        setSaving(false);
    };

    const updateField = (section: string, field: string, value: string | string[]) => {
        if (!content) return;
        setContent({
            ...content,
            [section]: {
                ...content[section as keyof SiteContent],
                [field]: value,
            },
        });
    };

    const updateArrayField = (section: string, field: string, index: number, value: string) => {
        if (!content) return;
        const newArray = [...((content[section as keyof SiteContent][field] as string[]) || [])];
        newArray[index] = value;
        setContent({
            ...content,
            [section]: {
                ...content[section as keyof SiteContent],
                [field]: newArray,
            },
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!content) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-red-500">Failed to load content</div>
            </div>
        );
    }

    const sections = [
        { id: "hero", name: "Hero Section", icon: "🏠" },
        { id: "about", name: "About Page", icon: "👤" },
        { id: "contact", name: "Contact Page", icon: "📧" },
        { id: "philosophy", name: "Philosophy", icon: "💭" },
        { id: "what_i_design", name: "What I Change", icon: "🎨" },
        { id: "social", name: "Social Links", icon: "🔗" },
        { id: "why_me", name: "Why Me", icon: "⭐" },
        { id: "credibility", name: "Credibility", icon: "✨" },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-black border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold">📝 Content Editor</h1>
                    <div className="flex items-center gap-4">
                        {message && (
                            <span className="text-sm px-4 py-2 bg-white/5 rounded">
                                {message}
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-brand-yellow text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving ? "Saving..." : "Save All Changes"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex max-w-7xl mx-auto">
                {/* Sidebar */}
                <div className="w-64 border-r border-white/10 min-h-screen p-6 sticky top-20">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">
                        Sections
                    </h2>
                    <div className="space-y-2">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full text-left px-4 py-3 rounded transition-colors ${activeSection === section.id
                                        ? "bg-brand-yellow text-black font-bold"
                                        : "bg-white/5 hover:bg-white/10"
                                    }`}
                            >
                                <span className="mr-2">{section.icon}</span>
                                {section.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8">
                    {/* Hero Section */}
                    {activeSection === "hero" && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold mb-8">🏠 Hero Section</h2>

                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Name</span>
                                    <input
                                        type="text"
                                        value={content.hero.name}
                                        onChange={(e) => updateField("hero", "name", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Title (English)</span>
                                    <input
                                        type="text"
                                        value={content.hero.title_en}
                                        onChange={(e) => updateField("hero", "title_en", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Title (Arabic)</span>
                                    <input
                                        type="text"
                                        value={content.hero.title_ar}
                                        onChange={(e) => updateField("hero", "title_ar", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                        dir="rtl"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Intro 1 (English)</span>
                                    <textarea
                                        value={content.hero.intro_1_en}
                                        onChange={(e) => updateField("hero", "intro_1_en", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                        rows={2}
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Intro 1 (Arabic)</span>
                                    <textarea
                                        value={content.hero.intro_1_ar}
                                        onChange={(e) => updateField("hero", "intro_1_ar", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                        rows={2}
                                        dir="rtl"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Intro 2 (English)</span>
                                    <textarea
                                        value={content.hero.intro_2_en}
                                        onChange={(e) => updateField("hero", "intro_2_en", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                        rows={2}
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Intro 2 (Arabic)</span>
                                    <textarea
                                        value={content.hero.intro_2_ar}
                                        onChange={(e) => updateField("hero", "intro_2_ar", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                        rows={2}
                                        dir="rtl"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Hero Image URL</span>
                                    <input
                                        type="text"
                                        value={content.hero.image}
                                        onChange={(e) => updateField("hero", "image", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* About Section */}
                    {activeSection === "about" && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold mb-8">👤 About Page</h2>

                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Who Title (English)</span>
                                    <input
                                        type="text"
                                        value={content.about.who_title_en}
                                        onChange={(e) => updateField("about", "who_title_en", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Who Title (Arabic)</span>
                                    <input
                                        type="text"
                                        value={content.about.who_title_ar}
                                        onChange={(e) => updateField("about", "who_title_ar", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                        dir="rtl"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Who Text (English)</span>
                                    <textarea
                                        value={content.about.who_text_en}
                                        onChange={(e) => updateField("about", "who_text_en", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                        rows={3}
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Who Text (Arabic)</span>
                                    <textarea
                                        value={content.about.who_text_ar}
                                        onChange={(e) => updateField("about", "who_text_ar", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                        rows={3}
                                        dir="rtl"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Think Title (English)</span>
                                    <input
                                        type="text"
                                        value={content.about.think_title_en}
                                        onChange={(e) => updateField("about", "think_title_en", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Think Title (Arabic)</span>
                                    <input
                                        type="text"
                                        value={content.about.think_title_ar}
                                        onChange={(e) => updateField("about", "think_title_ar", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                        dir="rtl"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Think Text (English)</span>
                                    <textarea
                                        value={content.about.think_text_en}
                                        onChange={(e) => updateField("about", "think_text_en", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                        rows={3}
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Think Text (Arabic)</span>
                                    <textarea
                                        value={content.about.think_text_ar}
                                        onChange={(e) => updateField("about", "think_text_ar", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                        rows={3}
                                        dir="rtl"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Do Title (English)</span>
                                    <input
                                        type="text"
                                        value={content.about.do_title_en}
                                        onChange={(e) => updateField("about", "do_title_en", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Do Title (Arabic)</span>
                                    <input
                                        type="text"
                                        value={content.about.do_title_ar}
                                        onChange={(e) => updateField("about", "do_title_ar", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                        dir="rtl"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Do Text (English)</span>
                                    <textarea
                                        value={content.about.do_text_en}
                                        onChange={(e) => updateField("about", "do_text_en", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                        rows={3}
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Do Text (Arabic)</span>
                                    <textarea
                                        value={content.about.do_text_ar}
                                        onChange={(e) => updateField("about", "do_text_ar", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                        rows={3}
                                        dir="rtl"
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Contact Section */}
                    {activeSection === "contact" && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold mb-8">📧 Contact Page</h2>

                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Title (English)</span>
                                    <textarea
                                        value={content.contact.title_en}
                                        onChange={(e) => updateField("contact", "title_en", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                        rows={3}
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Title (Arabic)</span>
                                    <textarea
                                        value={content.contact.title_ar}
                                        onChange={(e) => updateField("contact", "title_ar", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                        rows={3}
                                        dir="rtl"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Button Text (English)</span>
                                    <input
                                        type="text"
                                        value={content.contact.btn_en}
                                        onChange={(e) => updateField("contact", "btn_en", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Button Text (Arabic)</span>
                                    <input
                                        type="text"
                                        value={content.contact.btn_ar}
                                        onChange={(e) => updateField("contact", "btn_ar", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                        dir="rtl"
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Social Links */}
                    {activeSection === "social" && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold mb-8">🔗 Social Links</h2>

                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Title (English)</span>
                                    <input
                                        type="text"
                                        value={content.social.title_en}
                                        onChange={(e) => updateField("social", "title_en", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Title (Arabic)</span>
                                    <input
                                        type="text"
                                        value={content.social.title_ar}
                                        onChange={(e) => updateField("social", "title_ar", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                        dir="rtl"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Instagram URL</span>
                                    <input
                                        type="url"
                                        value={content.social.instagram}
                                        onChange={(e) => updateField("social", "instagram", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">LinkedIn URL</span>
                                    <input
                                        type="url"
                                        value={content.social.linkedin}
                                        onChange={(e) => updateField("social", "linkedin", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Philosophy */}
                    {activeSection === "philosophy" && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold mb-8">💭 Philosophy</h2>

                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Text (English)</span>
                                    <textarea
                                        value={content.philosophy.text_en}
                                        onChange={(e) => updateField("philosophy", "text_en", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                        rows={5}
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Text (Arabic)</span>
                                    <textarea
                                        value={content.philosophy.text_ar}
                                        onChange={(e) => updateField("philosophy", "text_ar", e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                        rows={5}
                                        dir="rtl"
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Why Me */}
                    {activeSection === "why_me" && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold mb-8">⭐ Why Me Statements</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold mb-4 text-brand-yellow">English Statements</h3>
                                    {(content.why_me.statements_en as string[]).map((statement: string, index: number) => (
                                        <label key={index} className="block mb-4">
                                            <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Statement {index + 1}</span>
                                            <textarea
                                                value={statement}
                                                onChange={(e) => updateArrayField("why_me", "statements_en", index, e.target.value)}
                                                className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none"
                                                rows={2}
                                            />
                                        </label>
                                    ))}
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold mb-4 text-brand-yellow">Arabic Statements</h3>
                                    {(content.why_me.statements_ar as string[]).map((statement: string, index: number) => (
                                        <label key={index} className="block mb-4">
                                            <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Statement {index + 1}</span>
                                            <textarea
                                                value={statement}
                                                onChange={(e) => updateArrayField("why_me", "statements_ar", index, e.target.value)}
                                                className="w-full mt-2 bg-white/5 border border-white/10 px-4 py-3 rounded focus:border-brand-yellow outline-none text-right"
                                                rows={2}
                                                dir="rtl"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
