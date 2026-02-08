"use client";

import React, { useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import type { Company } from "@/lib/data";
import { createOrUpdateCompany } from "@/lib/actions";
import { Loader2, Save, ArrowLeft, Bold, Italic, List, Heading1, Heading2, Quote, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";

// Tiptap Menu Bar
const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
                .then(res => res.json())
                .then(data => {
                    if (data.url) {
                        editor.chain().focus().setImage({ src: data.url }).run();
                    }
                })
                .catch(err => console.error(err));
        }
    };

    return (
        <div className="flex flex-wrap gap-2 border-b border-white/10 p-2 bg-neutral-900 sticky top-0 z-10">
            <input
                type="file"
                id="tiptap-image-upload"
                className="hidden"
                accept="image/*"
                onChange={addImage}
            />
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-white/10 ${editor.isActive('bold') ? 'text-brand-yellow' : 'text-white'}`}
                type="button"
                title="Bold"
            >
                <Bold size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-white/10 ${editor.isActive('italic') ? 'text-brand-yellow' : 'text-white'}`}
                type="button"
                title="Italic"
            >
                <Italic size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 1 }) ? 'text-brand-yellow' : 'text-white'}`}
                type="button"
                title="H1"
            >
                <Heading1 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 2 }) ? 'text-brand-yellow' : 'text-white'}`}
                type="button"
                title="H2"
            >
                <Heading2 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-white/10 ${editor.isActive('bulletList') ? 'text-brand-yellow' : 'text-white'}`}
                type="button"
                title="Bullet List"
            >
                <List size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-white/10 ${editor.isActive('blockquote') ? 'text-brand-yellow' : 'text-white'}`}
                type="button"
                title="Quote"
            >
                <Quote size={18} />
            </button>
            <button
                onClick={() => document.getElementById('tiptap-image-upload')?.click()}
                className="p-2 rounded hover:bg-white/10 text-white"
                type="button"
                title="Add Image"
            >
                <ImageIcon size={18} />
            </button>
        </div>
    );
};

interface Props {
    initialCompany?: Company;
    isNew?: boolean;
}

export default function CompanyEditor({ initialCompany, isNew = false }: Props) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'en' | 'ar'>('en');

    const [company, setCompany] = useState<Partial<Company>>(initialCompany || {
        name: "",
        slug: "",
        logo: "",
        description: "",
        description_ar: "",
        content: "<p>Start writing...</p>",
        content_ar: "<p>ابدأ الكتابة...</p>",
    });

    const editorEn = useEditor({
        extensions: [StarterKit, ImageExtension],
        content: company.content || "",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[400px] p-8',
            },
        },
        onUpdate: ({ editor }) => {
            setCompany(prev => ({ ...prev, content: editor.getHTML() }));
        }
    });

    const editorAr = useEditor({
        extensions: [StarterKit, ImageExtension],
        content: company.content_ar || "",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[400px] p-8 text-right',
                dir: 'rtl'
            },
        },
        onUpdate: ({ editor }) => {
            setCompany(prev => ({ ...prev, content_ar: editor.getHTML() }));
        }
    });

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            await createOrUpdateCompany(company as Company);
            router.refresh();
            await new Promise(r => setTimeout(r, 500));
        } catch (error) {
            alert("Error saving");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-8 pb-20">
            {/* Header Actions */}
            <div className="flex justify-between items-center sticky top-0 z-50 bg-neutral-900/90 backdrop-blur pb-4 pt-2 border-b border-white/10">
                <Link href="/admin/dashboard" className="text-gray-400 hover:text-white flex items-center gap-2">
                    <ArrowLeft size={18} /> Back
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 uppercase tracking-widest px-3 py-1 bg-white/5 rounded border border-white/5">
                        {isSaving ? "Publishing..." : "Draft"}
                    </span>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-brand-yellow text-black px-8 py-3 font-bold uppercase tracking-wider hover:bg-white transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-xl shadow-brand-yellow/10"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Publish
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Metadata Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-black border border-white/10 p-8 space-y-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-2">
                            <div className="w-1 h-4 bg-brand-yellow" /> Identity
                        </h3>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Company Name</label>
                            <input
                                type="text"
                                value={company.name}
                                onChange={e => setCompany({ ...company, name: e.target.value })}
                                className="w-full bg-neutral-900/50 border border-white/10 p-3 text-white focus:border-brand-yellow outline-none transition-all focus:bg-neutral-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Slug (URL)</label>
                            <input
                                type="text"
                                value={company.slug}
                                onChange={e => setCompany({ ...company, slug: e.target.value })}
                                className="w-full bg-neutral-900/50 border border-white/10 p-3 text-gray-400 focus:border-brand-yellow outline-none transition-all"
                            />
                        </div>

                        <ImageUploader
                            label="Project Logo"
                            value={company.logo || ""}
                            onChange={(url) => setCompany({ ...company, logo: url })}
                        />
                    </div>

                    {/* Language Switch for Context */}
                    <div className="bg-black border border-white/10 p-8 space-y-6 shadow-2xl">
                        <div className="flex gap-1 bg-neutral-900 p-1 border border-white/5">
                            <button type="button" onClick={() => setActiveTab('en')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'en' ? 'bg-brand-yellow text-black' : 'text-gray-500 hover:text-white'}`}>English</button>
                            <button type="button" onClick={() => setActiveTab('ar')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'ar' ? 'bg-brand-yellow text-black' : 'text-gray-500 hover:text-white'}`}>Arabic</button>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Short Memo</label>
                            <textarea
                                rows={4}
                                value={activeTab === 'en' ? company.description : company.description_ar}
                                onChange={e => activeTab === 'en' ? setCompany({ ...company, description: e.target.value }) : setCompany({ ...company, description_ar: e.target.value })}
                                className="w-full bg-neutral-900/50 border border-white/10 p-3 text-white focus:border-brand-yellow outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Editor */}
                <div className="lg:col-span-8">
                    <div className="bg-black border border-white/10 shadow-2xl min-h-[600px] flex flex-col">
                        <MenuBar editor={activeTab === 'en' ? editorEn : editorAr} />
                        <div className="flex-1 overflow-y-auto bg-neutral-950/20">
                            <div className={activeTab === 'en' ? 'block' : 'hidden'}>
                                <EditorContent editor={editorEn} />
                            </div>
                            <div className={activeTab === 'ar' ? 'block' : 'hidden'}>
                                <EditorContent editor={editorAr} />
                            </div>
                        </div>
                    </div>
                    <p className="mt-4 text-[10px] text-gray-600 uppercase tracking-widest">
                        Tip: You can paste images or use the image tool to insert visual elements within the flow of text.
                    </p>
                </div>
            </div>
        </form>
    );
}
