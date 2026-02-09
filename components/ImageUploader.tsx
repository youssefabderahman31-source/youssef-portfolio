"use client";

import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Heart } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    label: string;
    className?: string;
}

export default function ImageUploader({ value, onChange, label, className }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const onUpload = useCallback(async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            onChange(data.url);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    }, [onChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            onUpload(file);
        } else {
            alert('Please drag and drop an image file');
        }
    }, [onUpload]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className={clsx("space-y-2", className)}>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</label>

            {value ? (
                <div className="relative group aspect-video bg-neutral-900 border border-white/10 overflow-hidden rounded-lg shadow-lg">
                    <Image src={value} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="p-3 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors shadow-lg"
                        >
                            <X size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={() => document.getElementById(`image-input-${label}`)?.click()}
                            className="p-3 bg-brand-yellow text-black rounded-full hover:bg-white transition-colors shadow-lg font-bold"
                        >
                            <ImageIcon size={20} />
                        </button>
                    </div>
                    <input
                        id={`image-input-${label}`}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            ) : (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={clsx(
                        "relative aspect-video border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden rounded-lg shadow-md",
                        isDragging ? "border-brand-yellow bg-brand-yellow/10 shadow-lg shadow-brand-yellow/30" : "border-white/20 bg-black hover:border-white/30 hover:bg-neutral-900/50"
                    )}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-brand-yellow" size={40} />
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Uploading...</span>
                        </div>
                    ) : (
                        <>
                            <div className={clsx(
                                "p-4 bg-white/5 rounded-full transition-colors",
                                isDragging ? "text-brand-yellow bg-brand-yellow/10" : "text-gray-400"
                            )}>
                                <Upload size={40} />
                            </div>
                            <div className="text-center">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-white">Drag & Drop Your Logo</p>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-2">or click to browse files</p>
                            </div>
                            <div className="text-[9px] text-gray-600 uppercase tracking-widest mt-2">JPG, PNG, SVG • Max 5MB</div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
