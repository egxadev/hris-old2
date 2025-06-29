import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Shift } from '@/types/shift';
import { Head, usePage } from '@inertiajs/react';
import { ShiftForm } from './partials/form';

export default function ShiftEdit() {
    const { breadcrumbs, shift } = usePage<{
        breadcrumbs: BreadcrumbItem[];
        shift: Shift;
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Shift" description="Update a shift" />

                    <ShiftForm mode="edit" shift={shift} className="max-w-xl" />
                </div>
            </div>
        </AppLayout>
    );
}
