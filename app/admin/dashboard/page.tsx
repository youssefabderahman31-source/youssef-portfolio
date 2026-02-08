import React from "react";
import Image from "next/image";
import { getCompanies } from "@/lib/data";
import Link from "next/link";
import { Plus, Edit, Trash2, FileText, Briefcase } from "lucide-react";
import { removeCompany } from "@/lib/actions";

export default async function Dashboard() {
    const companies = await getCompanies();

    return (
        <div>
            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-10 border-b border-white/10 pb-4">
                <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-bold uppercase tracking-wider"
                >
                    <Briefcase size={20} />
                    Companies
                </Link>
                <Link
                    href="/admin/dashboard/content"
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-wider transition-colors"
                >
                    <FileText size={20} />
                    Edit Content
                </Link>
            </div>

            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold">Companies</h1>
                <Link href="/admin/dashboard/new" className="bg-brand-yellow text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-2">
                    <Plus size={20} /> Add New
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {companies.map((company) => (
                    <div key={company.id} className="bg-black border border-white/10 p-6 flex items-center justify-between group hover:border-brand-yellow/50 transition-colors">
                        <div className="flex items-center gap-6">
                            <Image src={company.logo} alt={company.name} width={64} height={64} className="w-16 h-16 object-contain bg-white/5 p-2" />
                            <div>
                                <h2 className="text-xl font-bold text-white">{company.name}</h2>
                                <p className="text-gray-500 text-sm truncate max-w-sm">{company.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link href={`/admin/dashboard/edit/${company.id}`} className="p-3 bg-white/5 hover:bg-white hover:text-black transition-colors rounded">
                                <Edit size={18} />
                            </Link>
                            <form action={async () => {
                                "use server";
                                await removeCompany(company.id);
                            }}>
                                <button className="p-3 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white transition-colors rounded">
                                    <Trash2 size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                ))}

                {companies.length === 0 && (
                    <div className="text-center py-20 bg-black/20 border border-white/5 border-dashed">
                        <p className="text-gray-500">No companies yet. Start by adding one.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
