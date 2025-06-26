'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PageProps } from '@/types';
import { Department } from '@/types/department';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
    name: z.string().min(2, { message: 'Department name must be at least 2 characters.' }),
    code: z.string().min(2, { message: 'Department code must be at least 2 characters.' }),
});

export function DepartmentForm({
    mode,
    department,
    className,
}: PageProps<{
    mode: 'create' | 'edit';
    department?: Department;
    className: string;
}>) {
    const { errors } = usePage().props;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: department?.name || '',
            code: department?.code || '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const isCreateMode = mode === 'create';
        const url = isCreateMode ? '/departments' : `/departments/${department?.id}`;

        if (isCreateMode) {
            router.post(url, values, {
                onSuccess: () => {
                    console.log('Department created successfully.');
                },
                onError: () => {
                    console.error('Failed to create department.');
                },
            });
        } else {
            router.put(url, values, {
                onSuccess: () => {
                    console.log('Department updated successfully.');
                },
                onError: () => {
                    console.error('Failed to update department.');
                },
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={`${className} space-y-8`}>
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Code Department</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage>{errors.code}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage>{errors.name}</FormMessage>
                        </FormItem>
                    )}
                />

                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
