import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { EmployeeForm } from './partials/form';
import { Department } from '@/types/department';
import { Region } from '@/types/region';
import { Branch } from '@/types/branch';
import { Position } from '@/types/position';
import { Role } from '@/types/role';

export default function EmployeeCreate({
    breadcrumbs,
    regions,
    branches,
    departments,
    positions,
    roles,
}: PageProps<{
    breadcrumbs: BreadcrumbItem[];
    regions: Region[];
    branches: Branch[];
    departments: Department[];
    positions: Position[];
    roles: Role[];
}>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Employee" description="Create a new employee" />

                    <EmployeeForm 
                        mode="create" 
                        className="max-w-4xl" 
                        regions={regions}
                        branches={branches}
                        departments={departments}
                        positions={positions}
                        roles={roles}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
