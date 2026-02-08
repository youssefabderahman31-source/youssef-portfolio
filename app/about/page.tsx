import React from "react";
import AboutPage from "@/components/AboutPage";
import { getSiteContent } from "@/lib/content";

export default async function Page() {
    const content = await getSiteContent();
    return <AboutPage content={content} />;
}
