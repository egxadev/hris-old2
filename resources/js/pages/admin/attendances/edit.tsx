import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Attendance } from '@/types/attendance';
import { Head } from '@inertiajs/react';
import { AttendanceForm } from './partials/form';

interface EmployeeOption {
    id: string;
    name: string;
}

export default function AttendanceEdit({
    breadcrumbs,
    attendance,
    employees,
}: PageProps<{
    breadcrumbs: BreadcrumbItem[];
    attendance: Attendance;
    employees: EmployeeOption[];
}>) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Attendance" description="Update a attendance" />

                    <AttendanceForm mode="edit" attendance={attendance} className="max-w-xl" employees={employees} />
                </div>
            </div>
        </AppLayout>
    );
}
