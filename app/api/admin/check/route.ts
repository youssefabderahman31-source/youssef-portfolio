import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');
    return NextResponse.json({ hasToken: !!token, tokenPreview: token ? token.value.slice(0,6) + '...' : null });
  } catch (error) {
    console.error('Check cookie error:', error);
    return NextResponse.json({ error: 'Failed to check cookie' }, { status: 500 });
  }
}
