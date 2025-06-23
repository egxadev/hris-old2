import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Position } from '@/types/position';
import { PositionForm } from './partials/form';
import { Region } from '@/types/region';
import { Branch } from '@/types/branch';
import { Department } from '@/types/department';

export default function PositionEdit({
    breadcrumbs,
    position,
    regions,
    branches,
    departments,
}: PageProps<{
    breadcrumbs: BreadcrumbItem[];
    position: Position;
    regions: Region[];
    branches: Branch[];
    departments: Department[];
}>) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Position" description="Update a position" />

                    <PositionForm mode="edit" position={position} className="max-w-xl" regions={regions} branches={branches} departments={departments} />
                </div>
            </div>
        </AppLayout>
    );
}
