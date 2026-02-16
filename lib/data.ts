import fs from 'fs/promises';
import path from 'path';
import { createServerSupabaseClient } from './supabase';

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
    // Try Supabase (server-side) first
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return await getLocalCompanies();

    try {
        const supa = createServerSupabaseClient();
        const { data, error } = await supa.from('companies').select('*');
        if (error || !data) return await getLocalCompanies();
        return data.map(mapDbCompany);
    } catch {
        return await getLocalCompanies();
    }
}

export async function getCompany(slug: string): Promise<Company | undefined> {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        const companies = await getLocalCompanies();
        return companies.find((c) => c.slug === slug);
    }
    try {
        const supa = createServerSupabaseClient();
        const { data, error } = await supa.from('companies').select('*').eq('slug', slug).limit(1).maybeSingle();
        if (error || !data) {
            const companies = await getLocalCompanies();
            return companies.find((c) => c.slug === slug);
        }
        return mapDbCompany(data as any);
    } catch {
        const companies = await getLocalCompanies();
        return companies.find((c) => c.slug === slug);
    }
}

export async function getCompanyById(id: string): Promise<Company | undefined> {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        const local = await getLocalCompanies();
        return local.find(c => c.id === id);
    }
    try {
        const supa = createServerSupabaseClient();
        const { data, error } = await supa.from('companies').select('*').eq('id', id).limit(1).maybeSingle();
        if (error || !data) {
            const local = await getLocalCompanies();
            return local.find(c => c.id === id);
        }
        return mapDbCompany(data as any);
    } catch {
        const local = await getLocalCompanies();
        return local.find(c => c.id === id);
    }
}

export async function saveCompany(company: Company): Promise<void> {
    const id = company.id || Date.now().toString();
    company.id = id;

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        const companies = await getLocalCompanies();
        const index = companies.findIndex((c) => c.id === id);
        if (index >= 0) companies[index] = company; else companies.push(company);
        const projects = await getLocalProjects();
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
        return;
    }

    try {
        const supa = createServerSupabaseClient();
        const dbObj = toDbCompany(company);
        const { error } = await supa.from('companies').upsert(dbObj, { onConflict: 'id' });
        if (error) {
            console.error('saveCompany: supabase upsert returned error', error);
            throw error;
        }
    } catch (err) {
        console.error('saveCompany: supabase upsert failed, falling back to local file', err);
        const companies = await getLocalCompanies();
        const index = companies.findIndex((c) => c.id === id);
        if (index >= 0) companies[index] = company; else companies.push(company);
        const projects = await getLocalProjects();
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
    }
}

export async function deleteCompany(id: string): Promise<void> {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        let companies = await getLocalCompanies();
        companies = companies.filter(c => c.id !== id);
        const projects = await getLocalProjects();
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
        return;
    }
    try {
        const supa = createServerSupabaseClient();
        await supa.from('companies').delete().eq('id', id);
    } catch {
        let companies = await getLocalCompanies();
        companies = companies.filter(c => c.id !== id);
        const projects = await getLocalProjects();
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
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
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return await getLocalProjects();
    try {
        const supa = createServerSupabaseClient();
        const { data, error } = await supa.from('projects').select('*');
        if (error || !data) return await getLocalProjects();
        return data.map(mapDbProject);
    } catch {
        return await getLocalProjects();
    }
}

export async function getProjectsByCompany(companyId: string): Promise<Project[]> {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        const projects = await getLocalProjects();
        return projects.filter(p => p.companyId === companyId);
    }
    try {
        const supa = createServerSupabaseClient();
        const { data, error } = await supa.from('projects').select('*').eq('company_id', companyId);
        if (error || !data) return await getLocalProjects();
        return data.map(mapDbProject).filter(p => p.companyId === companyId);
    } catch {
        const projects = await getLocalProjects();
        return projects.filter(p => p.companyId === companyId);
    }
}

export async function getProject(slug: string): Promise<Project | undefined> {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        const projects = await getLocalProjects();
        return projects.find((p) => p.slug === slug);
    }
    try {
        const supa = createServerSupabaseClient();
        const { data, error } = await supa.from('projects').select('*').eq('slug', slug).limit(1).maybeSingle();
        if (error || !data) {
            const projects = await getLocalProjects();
            return projects.find((p) => p.slug === slug);
        }
        return mapDbProject(data as any);
    } catch {
        const projects = await getLocalProjects();
        return projects.find((p) => p.slug === slug);
    }
}

export async function getProjectById(id: string): Promise<Project | undefined> {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        const local = await getLocalProjects();
        return local.find(p => p.id === id);
    }
    try {
        const supa = createServerSupabaseClient();
        const { data, error } = await supa.from('projects').select('*').eq('id', id).limit(1).maybeSingle();
        if (error || !data) {
            const local = await getLocalProjects();
            return local.find(p => p.id === id);
        }
        return mapDbProject(data as any);
    } catch {
        const local = await getLocalProjects();
        return local.find(p => p.id === id);
    }
}

export async function saveProject(project: Project): Promise<void> {
    const id = project.id || Date.now().toString();
    project.id = id;

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        const projects = await getLocalProjects();
        const index = projects.findIndex((p) => p.id === id);
        if (index >= 0) projects[index] = project; else projects.push(project);
        const companies = await getLocalCompanies();
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
        return;
    }

    try {
        const supa = createServerSupabaseClient();
        const dbObj = toDbProject(project);
        const { error } = await supa.from('projects').upsert(dbObj, { onConflict: 'id' });
        if (error) throw error;
    } catch (err) {
        const projects = await getLocalProjects();
        const index = projects.findIndex((p) => p.id === id);
        if (index >= 0) projects[index] = project; else projects.push(project);
        const companies = await getLocalCompanies();
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
    }
}

export async function deleteProject(id: string): Promise<void> {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        let projects = await getLocalProjects();
        projects = projects.filter(p => p.id !== id);
        const companies = await getLocalCompanies();
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
        return;
    }
    try {
        const supa = createServerSupabaseClient();
        await supa.from('projects').delete().eq('id', id);
    } catch {
        let projects = await getLocalProjects();
        projects = projects.filter(p => p.id !== id);
        const companies = await getLocalCompanies();
        await fs.writeFile(DATA_FILE, JSON.stringify({ companies, projects }, null, 2));
    }
}

// ------- Helpers: map between DB rows and TS types -------
function mapDbCompany(row: any): Company {
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        logo: row.logo,
        description: row.description,
        description_ar: row.description_ar,
        content: row.content,
        content_ar: row.content_ar,
        documentFile: row.document_file,
        documentName: row.document_name,
        documentType: row.document_type,
    } as Company;
}

function toDbCompany(c: Company) {
    return {
        id: c.id,
        slug: c.slug,
        name: c.name,
        logo: c.logo,
        description: c.description,
        description_ar: c.description_ar,
        content: c.content,
        content_ar: c.content_ar,
        document_file: c.documentFile,
        document_name: c.documentName,
        document_type: c.documentType,
    };
}

function mapDbProject(row: any): Project {
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        description_ar: row.description_ar,
        companyId: row.company_id,
        documentFile: row.document_file,
        documentName: row.document_name,
        documentType: row.document_type,
        content: row.content,
        content_ar: row.content_ar,
    } as Project;
}

function toDbProject(p: Project) {
    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        description_ar: p.description_ar,
        company_id: p.companyId,
        document_file: p.documentFile,
        document_name: p.documentName,
        document_type: p.documentType,
        content: p.content,
        content_ar: p.content_ar,
    };
}
