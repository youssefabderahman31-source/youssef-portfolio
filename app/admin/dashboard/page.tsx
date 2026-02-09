import React from "react";
import Image from "next/image";
import { getCompanies, getProjects, getProjectsByCompany } from "@/lib/data";
import Link from "next/link";
import { Plus, Edit, Trash2, FileText, Briefcase } from "lucide-react";
import { removeCompany, removeProject } from "@/lib/actions";

export default async function Dashboard() {
    const companies = await getCompanies();
    const projects = await getProjects();

    // Group projects by company
    const projectsByCompany = new Map<string, typeof projects>();
    for (const company of companies) {
        const companyProjects = await getProjectsByCompany(company.id);
        if (companyProjects.length > 0) {
            projectsByCompany.set(company.id, companyProjects);
        }
    }

    return (
        <div>
            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-10 border-b border-white/10 pb-4 flex-wrap">
                <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-bold text-sm uppercase tracking-wider"
                >
                    <Briefcase size={20} />
                    Companies
                </Link>
                <Link
                    href="/admin/dashboard/content"
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 font-bold text-sm uppercase tracking-wider transition-colors"
                >
                    <FileText size={20} />
                    Edit Content
                </Link>
            </div>

            {/* Companies Section */}
            <div className="mb-16">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold">🏢 Companies</h1>
                    <Link 
                        href="/admin/dashboard/company/new" 
                        className="bg-brand-yellow text-black px-6 py-3 font-bold text-sm uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Company
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {companies.map((company) => (
                        <div key={company.id} className="bg-black border border-white/10 p-6 flex items-center justify-between group hover:border-brand-yellow/50 transition-colors">
                            <div className="flex items-center gap-6 flex-1">
                                <Image 
                                    src={company.logo} 
                                    alt={company.name} 
                                    width={64} 
                                    height={64} 
                                    className="w-16 h-16 object-contain bg-brand-yellow/10 p-2 rounded" 
                                />
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-white">{company.name}</h2>
                                    <p className="text-gray-500 text-sm truncate max-w-md">{company.description}</p>
                                    {projectsByCompany.has(company.id) && (
                                        <p className="text-brand-yellow text-xs mt-1 font-bold">
                                            📁 {projectsByCompany.get(company.id)?.length} Project(s)
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Link 
                                    href={`/admin/dashboard/company/${company.id}`} 
                                    className="p-3 bg-white/5 hover:bg-white hover:text-black transition-colors rounded"
                                >
                                    <Edit size={18} />
                                </Link>
                                <form action={removeCompany}>
                                    <input type="hidden" name="id" value={company.id} />
                                    <button type="submit" className="p-3 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white transition-colors rounded">
                                        <Trash2 size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}

                    {companies.length === 0 && (
                        <div className="text-center py-20 bg-black/20 border border-white/5 border-dashed rounded">
                            <p className="text-gray-500">No companies yet. Start by adding one.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Projects Section */}
            <div>
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold">📁 Projects</h1>
                    <Link 
                        href="/admin/dashboard/new" 
                        className="bg-brand-yellow text-black px-6 py-3 font-bold text-sm uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Project
                    </Link>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-20 bg-black/20 border border-white/5 border-dashed rounded">
                        <p className="text-gray-500">No projects yet. Create one by linking it to a company.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {companies.map((company) => {
                            const companyProjects = projectsByCompany.get(company.id) || [];
                            if (companyProjects.length === 0) return null;

                            return (
                                <div key={company.id} className="bg-white/5 border border-white/10 p-6 rounded-lg">
                                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                                        <Image 
                                            src={company.logo} 
                                            alt={company.name} 
                                            width={48} 
                                            height={48} 
                                            className="w-12 h-12 object-contain bg-brand-yellow/10 p-1 rounded"
                                        />
                                        <h2 className="text-2xl font-bold text-brand-yellow">{company.name}</h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {companyProjects.map((project) => (
                                            <div key={project.id} className="bg-black/50 border border-white/5 p-4 rounded flex items-center justify-between hover:border-brand-yellow/30 transition-colors">
                                                <div>
                                                    <h3 className="font-bold text-white">{project.name}</h3>
                                                    <p className="text-gray-500 text-sm">{project.description}</p>
                                                    {project.documentFile && (
                                                        <p className="text-brand-yellow text-xs mt-1 font-bold">📄 {project.documentName}</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Link 
                                                        href={`/admin/dashboard/edit/${project.id}`} 
                                                        className="p-2 bg-white/5 hover:bg-white hover:text-black transition-colors rounded"
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
                                                    <form action={removeProject}>
                                                        <input type="hidden" name="id" value={project.id} />
                                                        <button type="submit" className="p-2 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white transition-colors rounded">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
