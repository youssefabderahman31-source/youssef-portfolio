import { db } from './firebase-admin';
import fs from 'fs/promises';
import path from 'path';

export interface Company {
    id: string;
    slug: string;
    name: string;
    logo: string;
    description: string;
    description_ar?: string;
    content: string;
    content_ar?: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'portfolio.json');

async function getLocalCompanies(): Promise<Company[]> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        const json = JSON.parse(data);
        return json.companies || [];
    } catch {
        return [];
    }
}

export async function getCompanies(): Promise<Company[]> {
    try {
        const snapshot = await db.collection('portfolio').get();
        if (snapshot.empty) {
            return await getLocalCompanies();
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
        // Fallback to local data silently
        return await getLocalCompanies();
    }
}

export async function getCompany(slug: string): Promise<Company | undefined> {
    const companies = await getCompanies();
    return companies.find((c) => c.slug === slug);
}

export async function getCompanyById(id: string): Promise<Company | undefined> {
    try {
        const doc = await db.collection('portfolio').doc(id).get();
        if (!doc.exists) {
            const local = await getLocalCompanies();
            return local.find(c => c.id === id);
        }
        return { id: doc.id, ...doc.data() } as Company;
    } catch {
        const local = await getLocalCompanies();
        return local.find(c => c.id === id);
    }
}

export async function saveCompany(company: Company): Promise<void> {
    const id = company.id || db.collection('portfolio').doc().id;
    try {
        await db.collection('portfolio').doc(id).set({
            ...company,
            id: id
        });
    } catch (error) {
        console.error("Firebase save failed:", error);
        const companies = await getLocalCompanies();
        const index = companies.findIndex((c) => c.id === id);
        if (index >= 0) {
            companies[index] = company;
        } else {
            companies.push(company);
        }
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies }, null, 2));
    }
}

export async function deleteCompany(id: string): Promise<void> {
    try {
        await db.collection('portfolio').doc(id).delete();
    } catch {
        let companies = await getLocalCompanies();
        companies = companies.filter(c => c.id !== id);
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies }, null, 2));
    }
}
