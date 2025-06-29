import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Shift } from '@/types/shift';
import { Head, usePage } from '@inertiajs/react';
import { ScheduleForm } from './partials/form';

interface EmployeeOption {
    id: string;
    name: string;
}

export default function ScheduleCreate() {
    const { breadcrumbs, employees, shifts } = usePage<{
        breadcrumbs: BreadcrumbItem[];
        employees: EmployeeOption[];
        shifts: Shift[];
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Schedule" description="Create a new schedule" />

                    <ScheduleForm mode="create" employees={employees} shifts={shifts} className="max-w-xl" />
                </div>
            </div>
        </AppLayout>
    );
}
