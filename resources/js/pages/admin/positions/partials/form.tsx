'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { Department } from '@/types/department';
import { Position } from '@/types/position';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
    department_id: z.string().min(1, { message: 'Department is required.' }),
    name: z.string().min(2, { message: 'Position name must be at least 2 characters.' }),
    code: z.string().min(2, { message: 'Position code must be at least 2 characters.' }),
});

export function PositionForm({
    mode,
    departments = [],
    position,
    className,
}: PageProps<{
    mode: 'create' | 'edit';
    className: string;
    departments?: Department[];
    position?: Position;
}>) {
    const { errors } = usePage().props;
    const [openDepartment, setOpenDepartment] = React.useState(false);

    // Get initial values for edit mode
    const initialDepartmentId = position?.department_id || '';

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            department_id: initialDepartmentId,
            name: position?.name || '',
            code: position?.code || '',
        },
    });

    // Create options from departments data
    const departmentOptions = departments.map((department) => ({
        label: department.name,
        value: department.id,
    }));

    function onSubmit(values: z.infer<typeof formSchema>) {
        const isCreateMode = mode === 'create';
        const url = isCreateMode ? '/admin/positions' : `/admin/positions/${position?.id}`;

        if (isCreateMode) {
            router.post(url, values, {
                onSuccess: () => {
                    console.log('Position created successfully.');
                },
                onError: () => {
                    console.error('Failed to create position.');
                },
            });
        } else {
            router.put(url, values, {
                onSuccess: () => {
                    console.log('Position updated successfully.');
                },
                onError: () => {
                    console.error('Failed to update position.');
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
                            <FormLabel>Position Code</FormLabel>
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
                            <FormLabel>Position Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage>{errors.name}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="department_id"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Department</FormLabel>
                            <Popover open={openDepartment} onOpenChange={setOpenDepartment}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openDepartment}
                                            className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                                        >
                                            {field.value ? departmentOptions.find((department) => department.value === field.value)?.label : 'Select department'}
                                            <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Search department..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No department found.</CommandEmpty>
                                            <CommandGroup>
                                                {departmentOptions.map((department) => (
                                                    <CommandItem
                                                        value={department.label}
                                                        key={department.value}
                                                        onSelect={() => {
                                                            form.setValue('department_id', department.value);
                                                            setOpenDepartment(false);
                                                        }}
                                                    >
                                                        {department.label}
                                                        <Check
                                                            className={cn('ml-auto', department.value === field.value ? 'opacity-100' : 'opacity-0')}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
