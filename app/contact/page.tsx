import React, { Suspense } from "react";
import ContactForm from "@/components/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact | Youssef Abderahman",
    description: "Let's build a legacy.",
};

export default function Page() {
    return (
        <div className="container mx-auto px-6 py-12 min-h-screen flex flex-col justify-center">
            <div className="mb-16">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">Contact Me</h1>
                <p className="text-xl text-gray-400">Let&apos;s build something that lasts.</p>
            </div>

            <Suspense fallback={<div>Loading form...</div>}>
                <ContactForm />
            </Suspense>
        </div>
    );
}
