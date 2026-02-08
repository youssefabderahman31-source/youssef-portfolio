import React from "react";
import { getCompany } from "@/lib/data";
import { notFound } from "next/navigation";
import CompanyDetail from "@/components/CompanyDetail";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const company = await getCompany(slug);
    if (!company) return { title: "Not Found" };
    return {
        title: `${company.name} | Youssef Abderahman`,
        description: company.description,
    };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const company = await getCompany(slug);

    if (!company) {
        notFound();
    }

    return <CompanyDetail company={company} />;
}
