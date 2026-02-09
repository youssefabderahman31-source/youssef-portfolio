import { NextResponse } from 'next/server';
import { saveProject } from '@/lib/data';
import { cookies } from 'next/headers';

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save project', error);
    return NextResponse.json({ error: 'Failed to save project' }, { status: 500 });
  }
}
