import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { RegionForm } from './partials/form';

export default function RegionCreate({
    breadcrumbs,
}: PageProps<{
    breadcrumbs: BreadcrumbItem[];
}>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Region" description="Create a new region" />

                    <RegionForm mode="create" className="max-w-xl" />
                </div>
            </div>
        </AppLayout>
    );
}
