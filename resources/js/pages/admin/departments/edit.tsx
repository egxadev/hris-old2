import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Department } from '@/types/department';
import { DepartmentForm } from './partials/form';

export default function DepartmentEdit({
    breadcrumbs,
    department,
}: PageProps<{
    breadcrumbs: BreadcrumbItem[];
    department: Department;
}>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Department" description="Update a department" />

                    <DepartmentForm mode="edit" department={department} className="max-w-xl" />
                </div>
            </div>
        </AppLayout>
    );
}
