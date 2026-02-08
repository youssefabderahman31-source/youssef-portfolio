"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  // Navigation
  nav_home: { en: "Home", ar: "الرئيسية" },
  nav_about: { en: "Who I Am", ar: "من أنا" },
  nav_portfolio: { en: "Work", ar: "أعمالي" },
  nav_contact: { en: "Contact", ar: "تواصل معي" },

  // Hero
  hero_title: { en: "Marketing Strategist & Copywriter", ar: "استراتيجي تسويق وباحث في الإدراك" },
  hero_intro_1: { en: "I study how meaning is formed.", ar: "أنا أدرس كيف يتشكل المعنى." },
  hero_intro_2: { en: "And redesign it.", ar: "وأعيد تصميمه." },
  hero_sub_1: { en: "Inside the Decision.", ar: "داخل عملية القرار." },
  hero_sub_2: { en: "Perception Designer.", ar: "مصمم للإدراك." },

  // Buttons
  btn_view_portfolio: { en: "View My Work", ar: "شاهد أعمالي" },
  btn_contact_me: { en: "Start a Conversation", ar: "ابدأ المحادثة" },
  btn_gallery: { en: "Gallery", ar: "المعرض" },

  // Footer
  footer_crafted: { en: "Between the product and the mind.", ar: "بين المنتج والعقل البشري." },
  footer_copy: { en: "Youssef Abdelrahman", ar: "يوسف عبدالرحمن" },

  // Contact Form
  form_name: { en: "How should I call you?", ar: "كيف يجب أن أناديك؟" },
  form_email: { en: "Where can I reach you?", ar: "أين يمكنني الوصول إليك؟" },
  form_message: { en: "What are we changing?", ar: "ما الذي سنغيره؟" },
  form_submit: { en: "Send Message", ar: "إرسال الرسالة" },
  form_sending: { en: "Transmitting...", ar: "جاري الإرسال..." },
  form_sent: { en: "Message Received", ar: "تم استلام الرسالة" },

  // Portfolio
  portfolio_intro: { en: "Work is evidence.", ar: "العمل هو الدليل." },

  // About Page Headers
  about_who: { en: "Who I Am", ar: "من أنا" },
  about_think: { en: "How Decisions Are Formed", ar: "كيف تتشكل القرارات" },
  about_do: { en: "What I Actually Change", ar: "ما الذي أغيره حقاً" },

  // Home Editorial Section
  editorial_1: { en: "Most products don’t fail.", ar: "معظم المنتجات لا تفشل." },
  editorial_2: { en: "Their interpretation does.", ar: "تأويلها هو ما يفشل." },
  editorial_3: { en: "I remove confusion.", ar: "أنا أزيل الغموض." },
  editorial_4: { en: "I shape what people feel.", ar: "أشكل ما يشعر به الناس." },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Persist language preference if needed, or default to EN
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    dir: language === "ar" ? "rtl" : "ltr" as "ltr" | "rtl",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
