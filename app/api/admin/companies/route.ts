import { NextResponse } from 'next/server';
import { getCompanies, saveCompany } from '@/lib/data';

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
  try {
    const body = await request.json();
    if (!body || !body.company) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await saveCompany(body.company);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save company', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
