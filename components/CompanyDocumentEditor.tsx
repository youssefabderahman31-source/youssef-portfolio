"use client";

import React, { useState } from "react";
import type { Company } from "@/lib/data";
import { createOrUpdateCompany } from "@/lib/actions";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Props {
  company?: Company;
  isNew?: boolean;
}

export default function CompanyEditor({ company, isNew = false }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: company?.name || "",
    description: company?.description || "",
    description_ar: company?.description_ar || "",
    logo: company?.logo || "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj,
        credentials: 'same-origin',
      });

      const data = await response.json();
      if (!response.ok) {
        const errMsg = data.message || data.error || "فشل رفع الشعار";
        setError(errMsg);
      } else if (data.url) {
        setFormData((prev) => ({ ...prev, logo: data.url }));
        setSuccess("تم تحديث الشعار!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("فشل رفع الشعار");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const companyData: Company = {
        id: company?.id || "",
        slug: company?.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        name: formData.name,
        logo: formData.logo,
        description: formData.description,
        description_ar: formData.description_ar,
      };

      await createOrUpdateCompany(companyData);
      setSuccess("تم الحفظ بنجاح!");

      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1500);
    } catch (err) {
      setError("فشل في حفظ البيانات");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-brand-yellow hover:text-white mb-2 flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft size={16} /> العودة
          </Link>
          <h1 className="text-4xl font-bold text-white">{isNew ? "شركة جديدة" : "تعديل الشركة"}</h1>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg text-green-400">
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logo Section */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg hover:border-white/20 transition-colors">
          <h2 className="text-xl font-bold mb-4 text-brand-yellow">🏢 الشعار</h2>
          <div className="flex gap-6 items-start">
            {formData.logo && (
              <Image
                src={formData.logo}
                alt="لوجو"
                width={100}
                height={100}
                className="w-24 h-24 object-contain bg-brand-yellow/10 p-2 rounded border border-brand-yellow/20"
              />
            )}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={isUploading}
                className="hidden"
              />
              <div className="px-6 py-3 bg-brand-yellow text-black font-bold rounded hover:bg-white transition-colors disabled:opacity-50">
                {isUploading ? "جاري..." : "تحديث الشعار"}
              </div>
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white/80 mb-2">اسم الشركة (EN)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-brand-yellow focus:bg-white/10 transition-all"
              placeholder="مثال: Apple Inc"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">الوصف (EN)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-brand-yellow focus:bg-white/10 transition-all resize-none"
                placeholder="وصف قصير عن الشركة"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">الوصف (AR)</label>
              <textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-brand-yellow focus:bg-white/10 transition-all text-right resize-none"
                placeholder="وصف قصير عن الشركة"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-brand-yellow text-black font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" /> جاري الحفظ
              </>
            ) : (
              <>
                <Save size={18} /> حفظ
              </>
            )}
          </button>
          <Link
            href="/admin/dashboard"
            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-bold rounded-lg transition-colors text-white"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}
