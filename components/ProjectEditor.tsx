"use client";

import React, { useState, useEffect, useRef } from "react";
import { Company, Project } from "@/lib/data";
import { createOrUpdateCompany, saveProjectAction } from "@/lib/actions";
import { saveCompany } from "@/lib/data";
import { getCompanies } from "@/lib/data";
import {
  Loader2,
  Save,
  ArrowLeft,
  FileUp,
  Trash2,
  Download,
  FileText,
  Plus,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FileUploadState {
  url: string;
  name: string;
  type: string;
  size: number;
}

interface Props {
  project?: Project;
  isNew?: boolean;
}

export default function ProjectEditor({ project, isNew = false }: Props) {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    description_ar: project?.description_ar || "",
    companyId: project?.companyId || "",
  });

  const [newCompanyData, setNewCompanyData] = useState({
    name: "",
    logo: "",
    description: "",
    description_ar: "",
  });

  const [documentFile, setDocumentFile] = useState<FileUploadState | null>(
    project?.documentFile
      ? {
          url: project.documentFile,
          name: project.documentName || "الملف",
          type: project.documentType || "",
          size: 0,
        }
      : null
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await getCompanies();
        setCompanies(data);
      } catch (err) {
        console.error("Failed to load companies:", err);
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "فشل رفع الملف");
        return;
      }

      setDocumentFile({
        url: data.url,
        name: data.name,
        type: data.type,
        size: data.size,
      });

      setSuccess("تم رفع الملف بنجاح!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("خطأ في رفع الملف");
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
      });

      const data = await response.json();
      if (data.url) {
        setNewCompanyData((prev) => ({ ...prev, logo: data.url }));
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

  const handleCreateNewCompany = async () => {
    if (!newCompanyData.name.trim()) {
      setError("أدخل اسم الشركة");
      return;
    }

    try {
      const company: Company = {
        id: "",
        slug: newCompanyData.name.toLowerCase().replace(/\s+/g, "-"),
        name: newCompanyData.name,
        logo: newCompanyData.logo,
        description: newCompanyData.description,
        description_ar: newCompanyData.description_ar,
      };

      await saveCompany(company);
      const savedCompany = { ...company, id: company.id || crypto.randomUUID() };
      setCompanies([...companies, savedCompany]);
      setFormData((prev) => ({ ...prev, companyId: savedCompany.id }));
      setNewCompanyData({ name: "", logo: "", description: "", description_ar: "" });
      setShowNewCompanyForm(false);
      setSuccess("تم إنشاء الشركة بنجاح!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("فشل في إنشاء الشركة");
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.companyId.trim()) {
      setError("اختر أو أنشئ شركة");
      return;
    }

    setIsSaving(true);

    try {
      const projectData: Project = {
        id: project?.id || "",
        slug: project?.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        name: formData.name,
        description: formData.description,
        description_ar: formData.description_ar,
        companyId: formData.companyId,
        documentFile: documentFile?.url,
        documentName: documentFile?.name,
        documentType: documentFile?.type,
        content: "",
        content_ar: "",
      };

      await saveProjectAction(projectData);
      setSuccess("تم الحفظ بنجاح!");

      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1500);
    } catch (err) {
      setError("فشل في حفظ البيانات");
      console.error(err);
      setIsSaving(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄 PDF";
    if (type.includes("word") || type.includes("document")) return "📝 Word";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊 Excel";
    if (type.includes("powerpoint") || type.includes("presentation")) return "🎯 PowerPoint";
    return "📎 ملف";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const selectedCompany = companies.find((c) => c.id === formData.companyId);

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
          <h1 className="text-4xl font-bold text-white">
            {isNew ? "مشروع جديد" : "تعديل المشروع"}
          </h1>
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
        {/* Company Selection */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg hover:border-white/20 transition-colors">
          <h2 className="text-xl font-bold mb-4 text-brand-yellow">🏢 اختر الشركة</h2>

          {loadingCompanies ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-brand-yellow" size={24} />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Company Dropdown */}
              <div>
                <label className="block text-sm font-bold text-white/80 mb-2">
                  الشركة الموجودة
                </label>
                <div className="relative">
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-brand-yellow focus:bg-white/10 transition-all"
                  >
                    <option value="">-- اختر شركة --</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute left-3 top-3.5 pointer-events-none text-white/40"
                  />
                </div>
              </div>

              {/* Show Selected Company Info */}
              {selectedCompany && (
                <div className="bg-brand-yellow/10 border border-brand-yellow/20 p-4 rounded-lg flex items-center gap-4">
                  {selectedCompany.logo && (
                    <Image
                      src={selectedCompany.logo}
                      alt={selectedCompany.name}
                      width={60}
                      height={60}
                      className="w-16 h-16 object-contain bg-brand-yellow/5 p-2 rounded"
                    />
                  )}
                  <div>
                    <p className="font-bold text-brand-yellow">{selectedCompany.name}</p>
                    <p className="text-white/70 text-sm line-clamp-2">
                      {selectedCompany.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Create New Company */}
              <button
                type="button"
                onClick={() => setShowNewCompanyForm(!showNewCompanyForm)}
                className="w-full py-3 border-2 border-dashed border-brand-yellow/40 rounded-lg text-brand-yellow font-bold hover:bg-brand-yellow/10 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} /> أو أنشئ شركة جديدة
              </button>

              {/* New Company Form */}
              {showNewCompanyForm && (
                <div className="bg-black/50 border border-brand-yellow/20 p-4 rounded-lg space-y-3">
                  <div>
                    <input
                      type="text"
                      value={newCompanyData.name}
                      onChange={(e) =>
                        setNewCompanyData({ ...newCompanyData, name: e.target.value })
                      }
                      placeholder="اسم الشركة"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-brand-yellow text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newCompanyData.description}
                      onChange={(e) =>
                        setNewCompanyData({ ...newCompanyData, description: e.target.value })
                      }
                      placeholder="الوصف (EN)"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-brand-yellow text-sm"
                    />
                    <input
                      type="text"
                      value={newCompanyData.description_ar}
                      onChange={(e) =>
                        setNewCompanyData({
                          ...newCompanyData,
                          description_ar: e.target.value,
                        })
                      }
                      placeholder="الوصف (AR)"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-brand-yellow text-right text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    {newCompanyData.logo && (
                      <Image
                        src={newCompanyData.logo}
                        alt="لوجو"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain bg-brand-yellow/10 p-1 rounded"
                      />
                    )}
                    <label className="cursor-pointer flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                      <div className="px-3 py-2 bg-brand-yellow/20 text-brand-yellow font-bold rounded hover:bg-brand-yellow/30 transition-colors disabled:opacity-50 text-center text-sm">
                        {isUploading ? "جاري..." : "شعار"}
                      </div>
                    </label>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCreateNewCompany}
                      className="px-4 py-2 bg-brand-yellow text-black font-bold rounded text-sm hover:bg-white transition-colors"
                    >
                      إنشاء
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCompanyForm(false)}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-white font-bold rounded text-sm hover:bg-white/10 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white/80 mb-2">اسم المشروع (EN)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-brand-yellow focus:bg-white/10 transition-all"
              placeholder="مثال: Condor Mask"
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
                placeholder="وصف قصير عن المشروع"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">الوصف (AR)</label>
              <textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-brand-yellow focus:bg-white/10 transition-all text-right resize-none"
                placeholder="وصف قصير عن المشروع"
              />
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg hover:border-brand-yellow/50 transition-colors">
          <h2 className="text-xl font-bold mb-4 text-brand-yellow flex items-center gap-2">
            <FileUp size={20} /> المستند / الملف
          </h2>
          <p className="text-white/60 text-sm mb-4">
            PDF, Word, Excel, أو PowerPoint (حتى 50MB)
          </p>

          {documentFile ? (
            <div className="bg-black/30 border border-brand-yellow/20 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl bg-brand-yellow/10 p-3 rounded">
                  {getFileIcon(documentFile.type).split(" ")[0]}
                </div>
                <div>
                  <p className="font-bold text-brand-yellow">{getFileIcon(documentFile.type)}</p>
                  <p className="text-white/80">{documentFile.name}</p>
                  <p className="text-white/40 text-xs">
                    {formatFileSize(documentFile.size)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={documentFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-brand-yellow/20 hover:bg-brand-yellow/40 text-brand-yellow rounded transition-colors"
                  title="عرض الملف"
                >
                  <Download size={18} />
                </a>
                <button
                  type="button"
                  onClick={() => setDocumentFile(null)}
                  className="p-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded transition-colors"
                  title="حذف الملف"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
                className="hidden"
              />
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-brand-yellow hover:bg-brand-yellow/5 transition-colors">
                <FileText size={40} className="mx-auto mb-3 text-brand-yellow" />
                <p className="text-white font-bold mb-1">اختر ملفك</p>
                <p className="text-white/60 text-sm">أو اسحب وأفلت الملف هنا</p>
                {isUploading && (
                  <Loader2 size={20} className="mx-auto mt-3 animate-spin text-brand-yellow" />
                )}
              </div>
            </label>
          )}
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
