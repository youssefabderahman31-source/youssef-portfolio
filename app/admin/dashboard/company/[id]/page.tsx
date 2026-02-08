import CompanyEditor from '@/components/CompanyEditor';
import { getCompanyById } from '@/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const company = await getCompanyById(id);

    if (!company) {
        notFound();
    }

    return <CompanyEditor initialCompany={company} />;
}
