import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Branch } from '@/types/branch';
import { Region } from '@/types/region';
import { Head } from '@inertiajs/react';
import { BranchForm } from './partials/form';

export default function BranchEdit({
    breadcrumbs,
    branch,
    regions,
}: PageProps<{
    breadcrumbs: BreadcrumbItem[];
    branch: Branch;
    regions: Region[];
}>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Branch" description="Update a branch" />

                    <BranchForm mode="edit" branch={branch} regions={regions} className="max-w-xl" />
                </div>
            </div>
        </AppLayout>
    );
}
