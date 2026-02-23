import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteCompany, deleteProject, getCompanyById, getProjectById } from '@/lib/data';
import { revalidatePublicPages } from '@/lib/revalidate';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_token')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const type = formData.get('type') as string;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
      let slug: string | undefined = undefined;
      if (type === 'company') {
        try {
          const company = await getCompanyById(id);
          slug = company?.slug;
        } catch (e) {
          console.log('Could not fetch company for revalidation before delete', e);
        }
        await deleteCompany(id);
      } else if (type === 'project') {
        try {
          const project = await getProjectById(id);
          if (project?.companyId) {
            const company = await getCompanyById(project.companyId);
            slug = company?.slug;
          }
        } catch (e) {
          console.log('Could not fetch project/company for revalidation before delete', e);
        }
        await deleteProject(id);
      } else {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
      }

      try {
        await revalidatePublicPages(slug);
      } catch (err) {
        console.error('Failed to revalidate after delete:', err);
      }

      return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      console.error('Error deleting:', error);
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
