import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google"; // Using Outfit and Playfair Display
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Youssef Abderahman | Marketing Strategist",
  description: "Marketing Strategist & Copywriter. I don’t belong to textbooks — I belong to experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${playfair.variable} antialiased selection:bg-brand-yellow selection:text-black`}>
        <LanguageProvider>
          <div className="flex flex-col min-h-screen bg-black text-white">
            <Header />
            <main className="flex-grow pt-20">
              {children}
            </main>
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
