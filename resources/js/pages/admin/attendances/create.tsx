import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { AttendanceForm } from './partials/form';

interface EmployeeOption {
    id: string;
    name: string;
}

export default function AttendanceCreate({
    breadcrumbs,
    employees,
}: PageProps<{
    breadcrumbs: BreadcrumbItem[];
    employees: EmployeeOption[];
}>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Attendance" description="Create a new attendance" />

                    <AttendanceForm mode="create" className="max-w-xl" employees={employees} />
                </div>
            </div>
        </AppLayout>
    );
}
