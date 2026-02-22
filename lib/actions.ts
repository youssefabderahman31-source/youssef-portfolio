'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { saveCompany, deleteCompany, Company, saveProject, deleteProject, Project, getCompanyById } from './data';
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
            sameSite: 'lax',
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
    // Revalidate public pages so changes appear immediately
    try {
        console.log('Revalidating paths: / and /portfolio' + (company.slug ? ` and /portfolio/${company.slug}` : ''));
        revalidatePath('/');
        revalidatePath('/portfolio');
        if (company.slug) revalidatePath(`/portfolio/${company.slug}`);
        console.log('Revalidation triggered successfully');
    } catch (err) {
        console.error('Revalidation failed:', err);
    }
    redirect('/admin/dashboard');
}

export async function removeCompany(formData: FormData) {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_token')) {
        // Not authenticated - send user to login
        redirect('/admin/login');
    }

    const id = formData.get('id') as string;
    if (!id) {
        // Missing id - redirect back with message
        redirect('/admin/dashboard?error=Company%20ID%20is%20required');
    }

    // Get company info BEFORE deletion so we can invalidate its specific page
    let companySlug: string | null = null;
    try {
        const company = await getCompanyById(id);
        if (company?.slug) {
            companySlug = company.slug;
        }
    } catch (err) {
        console.log('Could not fetch company info for revalidation:', err);
    }

    try {
        await deleteCompany(id);
        // Revalidate BEFORE redirect so it executes
        try {
            console.log('Revalidating paths after company delete: /, /portfolio' + (companySlug ? `, /portfolio/${companySlug}` : ''));
            revalidatePath('/');
            revalidatePath('/portfolio');
            if (companySlug) {
                revalidatePath(`/portfolio/${companySlug}`);
            }
            console.log('Revalidation triggered successfully (company delete)');
        } catch (err) {
            console.error('Revalidation failed (company delete):', err);
        }
    } catch (error) {
        console.error('Error deleting company:', error);
        // Redirect back to dashboard with an error query so UI can show message
        redirect('/admin/dashboard?error=Failed%20to%20delete%20company');
    }
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
    try {
        console.log('Revalidating paths after project save: / and /portfolio');
        revalidatePath('/');
        revalidatePath('/portfolio');
        // Revalidate the company page for this project
        const company = await getCompanyById(project.companyId);
        if (company?.slug) {
            revalidatePath(`/portfolio/${company.slug}`);
            console.log(`Revalidated company page: /portfolio/${company.slug}`);
        }
        console.log('Revalidation triggered successfully (project save)');
    } catch (err) {
        console.error('Revalidation failed (project save):', err);
    }
    redirect('/admin/dashboard');
}

export async function removeProject(formData: FormData) {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_token')) {
        redirect('/admin/login');
    }

    const id = formData.get('id') as string;
    if (!id) {
        redirect('/admin/dashboard?error=Project%20ID%20is%20required');
    }

    // Get project info BEFORE deletion so we can invalidate its company's page
    let companySlug: string | null = null;
    try {
        const project = await getProjectById(id);
        if (project?.companyId) {
            const company = await getCompanyById(project.companyId);
            if (company?.slug) {
                companySlug = company.slug;
            }
        }
    } catch (err) {
        console.log('Could not fetch project info for revalidation:', err);
    }

    try {
        await deleteProject(id);
        // Revalidate BEFORE redirect so it executes
        try {
            console.log('Revalidating paths after project delete: /, /portfolio' + (companySlug ? `, /portfolio/${companySlug}` : ''));
            revalidatePath('/');
            revalidatePath('/portfolio');
            if (companySlug) {
                revalidatePath(`/portfolio/${companySlug}`);
            }
            console.log('Revalidation triggered successfully (project delete)');
        } catch (err) {
            console.error('Revalidation failed (project delete):', err);
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        redirect('/admin/dashboard?error=Failed%20to%20delete%20project');
    }
    redirect('/admin/dashboard');
}

