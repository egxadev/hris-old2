import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { DepartmentForm } from './partials/form';
import { Branch } from '@/types/branch';
import { Region } from '@/types/region';

export default function DepartmentCreate({
    breadcrumbs,
    branches,
    regions,
}: PageProps<{
    breadcrumbs: BreadcrumbItem[];
    branches: Branch[];
    regions: Region[];
}>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Department" description="Create a new department" />

                    <DepartmentForm mode="create" className="max-w-xl" branches={branches} regions={regions} />
                </div>
            </div>
        </AppLayout>
    );
}
