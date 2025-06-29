import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { BranchForm } from './partials/form';
import { Region } from '@/types/region';

export default function BranchCreate({
    breadcrumbs,
    regions,
}: PageProps<{
    breadcrumbs: BreadcrumbItem[];
    regions: Region[];
}>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Branch" description="Create a new branch" />

                    <BranchForm mode="create" className="max-w-xl" regions={regions} />
                </div>
            </div>
        </AppLayout>
    );
}
