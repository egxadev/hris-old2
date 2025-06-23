import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Region } from '@/types/region';
import { RegionForm } from './partials/form';

export default function RegionEdit({
    breadcrumbs,
    region,
}: PageProps<{
    breadcrumbs: BreadcrumbItem[];
    region: Region;
}>) {
    console.log(region);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Region" description="Update a region" />

                    <RegionForm mode="edit" region={region} className="max-w-xl" />
                </div>
            </div>
        </AppLayout>
    );
}
