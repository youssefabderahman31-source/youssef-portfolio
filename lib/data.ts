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
    content?: string;
    content_ar?: string;
    documentFile?: string;
    documentName?: string;
    documentType?: string;
}

export interface Project {
    id: string;
    slug: string;
    name: string;
    description: string;
    description_ar?: string;
    companyId: string;
    documentFile?: string;
    documentName?: string;
    documentType?: string;
    content?: string;
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
    if (!db) {
        return await getLocalCompanies();
    }
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
    if (!db) {
        const local = await getLocalCompanies();
        return local.find(c => c.id === id);
    }
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
    const id = company.id || (db ? db.collection('portfolio').doc().id : Date.now().toString());
    
    if (!db) {
        // Use local storage only
        const companies = await getLocalCompanies();
        const index = companies.findIndex((c) => c.id === id);
        if (index >= 0) {
            companies[index] = company;
        } else {
            companies.push(company);
        }
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies }, null, 2));
        return;
    }
    
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
    if (!db) {
        let companies = await getLocalCompanies();
        companies = companies.filter(c => c.id !== id);
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies }, null, 2));
        return;
    }
    try {
        await db.collection('portfolio').doc(id).delete();
    } catch {
        let companies = await getLocalCompanies();
        companies = companies.filter(c => c.id !== id);
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies }, null, 2));
    }
}

// ========== PROJECTS ==========

async function getLocalProjects(): Promise<Project[]> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        const json = JSON.parse(data);
        return json.projects || [];
    } catch {
        return [];
    }
}

export async function getProjects(): Promise<Project[]> {
    if (!db) {
        return await getLocalProjects();
    }
    try {
        const snapshot = await db.collection('projects').get();
        if (snapshot.empty) {
            return await getLocalProjects();
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    } catch (_error) {
        return await getLocalProjects();
    }
}

export async function getProjectsByCompany(companyId: string): Promise<Project[]> {
    const projects = await getProjects();
    return projects.filter(p => p.companyId === companyId);
}

export async function getProject(slug: string): Promise<Project | undefined> {
    const projects = await getProjects();
    return projects.find((p) => p.slug === slug);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
    if (!db) {
        const local = await getLocalProjects();
        return local.find(p => p.id === id);
    }
    try {
        const doc = await db.collection('projects').doc(id).get();
        if (!doc.exists) {
            const local = await getLocalProjects();
            return local.find(p => p.id === id);
        }
        return { id: doc.id, ...doc.data() } as Project;
    } catch {
        const local = await getLocalProjects();
        return local.find(p => p.id === id);
    }
}

export async function saveProject(project: Project): Promise<void> {
    const id = project.id || (db ? db.collection('projects').doc().id : Date.now().toString());

    if (!db) {
        const projects = await getLocalProjects();
        const index = projects.findIndex((p) => p.id === id);
        if (index >= 0) {
            projects[index] = project;
        } else {
            projects.push(project);
        }
        const companies = await getLocalCompanies();
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
        return;
    }

    try {
        await db.collection('projects').doc(id).set({
            ...project,
            id: id
        });
    } catch (error) {
        console.error("Firebase project save failed:", error);
        const projects = await getLocalProjects();
        const index = projects.findIndex((p) => p.id === id);
        if (index >= 0) {
            projects[index] = project;
        } else {
            projects.push(project);
        }
        const companies = await getLocalCompanies();
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
    }
}

export async function deleteProject(id: string): Promise<void> {
    if (!db) {
        let projects = await getLocalProjects();
        projects = projects.filter(p => p.id !== id);
        const companies = await getLocalCompanies();
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
        return;
    }
    try {
        await db.collection('projects').doc(id).delete();
    } catch {
        let projects = await getLocalProjects();
        projects = projects.filter(p => p.id !== id);
        const companies = await getLocalCompanies();
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
    }
}
