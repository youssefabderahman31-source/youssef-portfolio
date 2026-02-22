import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_token')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || null;

    let companiesCount = null;
    try {
        if (hasServiceKey) {
            const supa = createServerSupabaseClient();
            const { data } = await supa.from('companies').select('id', { count: 'exact' }).limit(1);
            // supabase-js returns count in range object; fallback to null
            companiesCount = (data && Array.isArray(data)) ? undefined : undefined;
        }
    } catch (err) {
        // ignore
    }

    return NextResponse.json({ hasServiceKey, supaUrl, companiesCount });
}
