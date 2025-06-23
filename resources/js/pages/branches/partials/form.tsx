'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { Branch } from '@/types/branch';
import { Region } from '@/types/region';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
    region_id: z.string().min(1, { message: 'Region id is required.' }),
    name: z.string().min(2, { message: 'Region name must be at least 2 characters.' }),
    code: z.string().min(2, { message: 'Region code must be at least 2 characters.' }),
    address: z.string().min(2, { message: 'Address must be at least 2 characters.' }),
});

export function BranchForm({
    mode,
    branch,
    regions,
    className,
}: PageProps<{
    mode: 'create' | 'edit';
    branch?: Branch;
    className: string;
    regions: Region[];
}>) {
    const { errors } = usePage().props;
    const [open, setOpen] = React.useState(false);

    const regionOptions = regions.map((region) => ({
        label: region.name,
        value: region.id,
    }));

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            region_id: branch?.region_id,
            name: branch?.name,
            code: branch?.code,
            address: branch?.address,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const isCreateMode = mode === 'create';
        const url = isCreateMode ? '/branches' : `/branches/${branch?.id}`;

        if (isCreateMode) {
            router.post(url, values, {
                onSuccess: () => {
                    console.log('Branch created successfully.');
                },
                onError: () => {
                    console.error('Failed to create branch.');
                },
            });
        } else {
            router.put(url, values, {
                onSuccess: () => {
                    console.log('Branch updated successfully.');
                },
                onError: () => {
                    console.error('Failed to update branch.');
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
                            <FormLabel>Code Branch</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage>{errors.email}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Branch Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage>{errors.name}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage>{errors.address}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    name="region_id"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Region</FormLabel>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className={cn('w-[200px] justify-between', !field.value && 'text-muted-foreground')}
                                        >
                                            {field.value ? regionOptions.find((region) => region.value === field.value)?.label : 'Select region'}
                                            <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search region..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No region found.</CommandEmpty>
                                            <CommandGroup>
                                                {regionOptions.map((region) => (
                                                    <CommandItem
                                                        value={region.label}
                                                        key={region.value}
                                                        onSelect={() => {
                                                            form.setValue('region_id', region.value);
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        {region.label}
                                                        <Check
                                                            className={cn('ml-auto', region.value === field.value ? 'opacity-100' : 'opacity-0')}
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
