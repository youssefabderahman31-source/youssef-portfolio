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
    return await getLocalCompanies();
}

export async function getCompany(slug: string): Promise<Company | undefined> {
    const companies = await getCompanies();
    return companies.find((c) => c.slug === slug);
}

export async function getCompanyById(id: string): Promise<Company | undefined> {
    const local = await getLocalCompanies();
    return local.find(c => c.id === id);
}

export async function saveCompany(company: Company): Promise<void> {
    const id = company.id || Date.now().toString();
    
    const companies = await getLocalCompanies();
    const index = companies.findIndex((c) => c.id === id);
    if (index >= 0) {
        companies[index] = company;
    } else {
        companies.push(company);
    }
    const projects = await getLocalProjects();
    await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
}

export async function deleteCompany(id: string): Promise<void> {
    let companies = await getLocalCompanies();
    companies = companies.filter(c => c.id !== id);
    const projects = await getLocalProjects();
    await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
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
    return await getLocalProjects();
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
    const local = await getLocalProjects();
    return local.find(p => p.id === id);
}

export async function saveProject(project: Project): Promise<void> {
    const id = project.id || Date.now().toString();

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

export async function deleteProject(id: string): Promise<void> {
    let projects = await getLocalProjects();
    projects = projects.filter(p => p.id !== id);
    const companies = await getLocalCompanies();
    await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
}
