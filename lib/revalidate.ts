import { revalidatePath } from 'next/cache';

export async function revalidatePublicPages(slug?: string) {
    try {
        // Core pages
        revalidatePath('/');
        revalidatePath('/portfolio');
        if (slug) revalidatePath(`/portfolio/${slug}`);
    } catch (err) {
        console.error('revalidatePublicPages failed:', err);
    }
}

export async function revalidateHomeAndPortfolio() {
    return revalidatePublicPages();
}

export default revalidatePublicPages;
