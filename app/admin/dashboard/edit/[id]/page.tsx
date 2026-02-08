import ProjectEditor from '@/components/ProjectEditor';
import { getProjectById } from '@/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
        notFound();
    }

    return <ProjectEditor project={project} />;
}
