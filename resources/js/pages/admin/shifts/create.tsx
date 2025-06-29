import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ShiftForm } from './partials/form';

export default function ShiftCreate() {
    const { breadcrumbs } = usePage<{
        breadcrumbs: BreadcrumbItem[];
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Shift" description="Create a new shift" />

                    <ShiftForm mode="create" className="max-w-xl" />
                </div>
            </div>
        </AppLayout>
    );
}
