import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteCompany, deleteProject } from '@/lib/data';

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
      if (type === 'company') {
        await deleteCompany(id);
      } else if (type === 'project') {
        await deleteProject(id);
      } else {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
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
