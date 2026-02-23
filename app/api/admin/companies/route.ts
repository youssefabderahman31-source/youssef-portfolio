import { NextResponse } from 'next/server';
import { getCompanies, saveCompany } from '@/lib/data';
import { revalidatePublicPages } from '@/lib/revalidate';

export async function GET() {
  try {
    const companies = await getCompanies();
    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Failed to fetch companies', error);
    return NextResponse.json({ companies: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let company: any = undefined;
  try {
    const body = await request.json();
    if (!body || !body.company) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    company = body.company;
    // Ensure company has an id when saved locally so client can select it immediately
    if (!company.id) {
      company.id = Date.now().toString();
    }
    // Ensure slug exists (mirror behavior in server actions)
    if (!company.slug && company.name) {
      company.slug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    await saveCompany(company);
    // Revalidate public pages so change appears immediately
    try {
      await revalidatePublicPages(company.slug);
    } catch (err) {
      console.error('Failed to revalidate after saving company:', err);
    }
    return NextResponse.json({ success: true, id: company.id });
  } catch (error) {
    try {
      console.error('Failed to save company', { company, error: (error as any)?.stack || error });
    } catch (logErr) {
      console.error('Failed to save company and failed logging details', logErr, 'original error:', error);
    }
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
