'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { saveCompany, deleteCompany, Company, saveProject, deleteProject, Project } from './data';
import { updateSiteContent, SiteContent } from './content';

export async function login(prevState: { message: string } | null | undefined, formData: FormData) {
    const password = formData.get('password');

    // Hardcoded demo password
    // In a real env, check process.env.ADMIN_PASSWORD
    if (password === 'admin123') {
        (await cookies()).set('admin_token', 'authorized', {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        });
        redirect('/admin/dashboard');
    } else {
        return { message: 'Invalid Credentials' };
    }
}

export async function logout() {
    (await cookies()).delete('admin_token');
    redirect('/');
}

export async function createOrUpdateCompany(company: Company) {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_token')) {
        throw new Error("Unauthorized");
    }

    // Basic validation
    if (!company.name) throw new Error("Name is required");

    // Auto-generate ID/Slug if missing
    if (!company.id) {
        company.id = crypto.randomUUID();
    }
    if (!company.slug) {
        company.slug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    await saveCompany(company);
    // Revalidate paths if needed, or just redirect
    redirect('/admin/dashboard');
}

export async function removeCompany(id: string) {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_token')) {
        throw new Error("Unauthorized");
    }

    await deleteCompany(id);
    redirect('/admin/dashboard');
}

export async function saveSiteContent(content: SiteContent) {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_token')) {
        throw new Error("Unauthorized");
    }
    await updateSiteContent(content);
}

export async function saveProjectAction(project: Project) {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_token')) {
        throw new Error("Unauthorized");
    }

    // Basic validation
    if (!project.name) throw new Error("Name is required");
    if (!project.companyId) throw new Error("Company is required");

    // Auto-generate ID/Slug if missing
    if (!project.id) {
        project.id = crypto.randomUUID();
    }
    if (!project.slug) {
        project.slug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    await saveProject(project);
    // Revalidate paths if needed, or just redirect
    redirect('/admin/dashboard');
}

export async function removeProject(id: string) {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_token')) {
        throw new Error("Unauthorized");
    }

    await deleteProject(id);
    redirect('/admin/dashboard');
}

