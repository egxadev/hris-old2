import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { CheckoutForm } from './partials/form';
import * as React from 'react';
import { toast } from 'sonner';

export default function AttendanceCheckout({
    breadcrumbs,
}: PageProps<{
    breadcrumbs: BreadcrumbItem[];
}>) {
    const { flash } = usePage<{
        flash: {
            success: string;
            error: string;
            warning: string;
            info: string;
        };
    }>().props;

    // Handle flash messages
    React.useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
        if (flash.warning) toast.warning(flash.warning);
        if (flash.info) toast.info(flash.info);
}, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full p-4">
                <div className="mx-auto space-y-6">
                    <Heading title="Attendance" description="Record your check-out" />

                    <CheckoutForm className="max-w-xl" />
                </div>
            </div>
        </AppLayout>
    );
}
