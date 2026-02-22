import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_token')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const slug = body?.slug as string | undefined;

        console.log('Manual revalidation requested', { slug });

        revalidatePath('/');
        revalidatePath('/portfolio');
        if (slug) revalidatePath(`/portfolio/${slug}`);

        console.log('Manual revalidation triggered', { slug });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('Manual revalidation failed', err);
        return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
    }
}
