import { NextResponse } from 'next/server';
import { saveProject, getCompanyById } from '@/lib/data';
import { cookies } from 'next/headers';
import { revalidatePublicPages } from '@/lib/revalidate';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  if (!cookieStore.get('admin_token')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const project = body.project;
    if (!project) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    // Basic validation
    if (!project.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!project.companyId) return NextResponse.json({ error: 'Company is required' }, { status: 400 });

    await saveProject(project);
    // Revalidate the portfolio page for this project's company
    try {
      const company = await getCompanyById(project.companyId);
      await revalidatePublicPages(company?.slug);
    } catch (err) {
      console.error('Failed to revalidate after saving project:', err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save project', error);
    return NextResponse.json({ error: 'Failed to save project' }, { status: 500 });
  }
}
