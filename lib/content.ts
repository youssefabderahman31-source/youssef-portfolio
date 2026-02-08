import { db } from './firebase-admin';
import fs from 'fs/promises';
import path from 'path';

export interface SiteContent {
    hero: {
        name: string;
        title_en: string;
        title_ar: string;
        intro_1_en: string;
        intro_1_ar: string;
        intro_2_en: string;
        intro_2_ar: string;
        sub_1_en: string;
        sub_1_ar: string;
        sub_2_en: string;
        sub_2_ar: string;
        image: string;
    };
    why_me?: {
        statements_en: string[];
        statements_ar: string[];
    };
    philosophy: {
        text_en: string;
        text_ar: string;
        sub_en: string;
        sub_ar: string;
    };
    credibility?: {
        lines_en: string[];
        lines_ar: string[];
    };
    social?: {
        title_en: string;
        title_ar: string;
        sub_en: string;
        sub_ar: string;
        instagram?: string;
        linkedin?: string;
        twitter?: string;
        whatsapp?: string;
    };
    contact?: {
        title_en: string;
        title_ar: string;
        btn_en: string;
        btn_ar: string;
    };
    what_i_design?: {
        title_en: string;
        title_ar: string;
        categories_en: { title: string; desc: string }[];
        categories_ar: { title: string; desc: string }[];
    };
    editorial?: {
        section_1_en: string;
        section_1_ar: string;
        section_2_en: string;
        section_2_ar: string;
        section_3_en: string;
        section_3_ar: string;
        section_4_en: string;
        section_4_ar: string;
    };
    about?: {
        who_title_en: string;
        who_title_ar: string;
        who_text_en: string;
        who_text_ar: string;
        think_title_en: string;
        think_title_ar: string;
        think_text_en: string;
        think_text_ar: string;
        do_title_en: string;
        do_title_ar: string;
        do_text_en: string;
        do_text_ar: string;
    };
    story?: {
        text_head_en: string;
        text_head_ar: string;
        text_1_en: string;
        text_1_ar: string;
        text_2_en: string;
        text_2_ar: string;
        text_3_en: string;
        text_3_ar: string;
    };
    teaser?: {
        text_en: string;
        text_ar: string;
    };
    final_cta: {
        text_en: string;
        text_ar: string;
    };
}

async function getLocalContent(): Promise<SiteContent> {
    const CONTENT_FILE = path.join(process.cwd(), 'data', 'site-content.json');
    const data = await fs.readFile(CONTENT_FILE, 'utf-8');
    return JSON.parse(data);
}

export async function getSiteContent(): Promise<SiteContent> {
    try {
        const doc = await db.collection('settings').doc('site-content').get();
        if (!doc.exists) {
            return await getLocalContent();
        }
        return doc.data() as SiteContent;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
        // Return local content silently if Firebase fails (e.g. API not enabled)
        return await getLocalContent();
    }
}

export async function updateSiteContent(newContent: SiteContent): Promise<void> {
    try {
        await db.collection('settings').doc('site-content').set(newContent);
    } catch (error) {
        console.error("Failed to update Firebase site content:", error);
        // Still update local for safety if Firebase fails
        const CONTENT_FILE = path.join(process.cwd(), 'data', 'site-content.json');
        await fs.writeFile(CONTENT_FILE, JSON.stringify(newContent, null, 2));
    }
}
