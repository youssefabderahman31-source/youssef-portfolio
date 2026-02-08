import React from "react";
import { getCompanies } from "@/lib/data";
import PortfolioGrid from "@/components/PortfolioGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Portfolio | Youssef Abderahman",
    description: "Selected works and case studies.",
};

export default async function Page() {
    const companies = await getCompanies();
    return <PortfolioGrid companies={companies} />;
}
