import React from "react";
import HomePage from "@/components/HomePage";
import { getSiteContent } from "@/lib/content";
import { getCompanies } from "@/lib/data";

export default async function Page() {
  const content = await getSiteContent();
  const companies = await getCompanies();
  return <HomePage content={content} companies={companies} />;
}
