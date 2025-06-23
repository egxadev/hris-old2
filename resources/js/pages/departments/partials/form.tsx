'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { Branch } from '@/types/branch';
import { Department } from '@/types/department';
import { Region } from '@/types/region';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
    region_id: z.string().min(1, { message: 'Region is required.' }),
    branch_id: z.string().min(1, { message: 'Branch is required.' }),
    name: z.string().min(2, { message: 'Department name must be at least 2 characters.' }),
    code: z.string().min(2, { message: 'Department code must be at least 2 characters.' }),
});

export function DepartmentForm({
    mode,
    department,
    branches,
    regions,
    className,
}: PageProps<{
    mode: 'create' | 'edit';
    department?: Department;
    className: string;
    branches: Branch[];
    regions: Region[];
}>) {
    const { errors } = usePage().props;
    const [openBranch, setOpenBranch] = React.useState(false);
    const [openRegion, setOpenRegion] = React.useState(false);
    const [filteredBranches, setFilteredBranches] = React.useState<Branch[]>(branches);
    const [isLoading, setIsLoading] = React.useState(false);

    console.log(regions);
    

    const regionOptions = regions.map((region) => ({
        label: region.name,
        value: region.id,
    }));

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            region_id: department?.branch?.region_id || '',
            branch_id: department?.branch_id || '',
            name: department?.name || '',
            code: department?.code || '',
        },
    });

    // Watch for region_id changes to filter branches
    const selectedRegionId = form.watch('region_id');

    React.useEffect(() => {
        if (selectedRegionId) {
            setIsLoading(true);
            // Fetch branches for the selected region from API
            axios.get(`/api/regions/${selectedRegionId}/branches`)
                .then(response => {
                    setFilteredBranches(response.data);
                    
                    // Reset branch_id if the selected branch is not in the filtered list
                    const currentBranchId = form.getValues('branch_id');
                    if (currentBranchId && !response.data.some((branch: Branch) => branch.id === currentBranchId)) {
                        form.setValue('branch_id', '');
                    }
                })
                .catch(error => {
                    console.error('Error fetching branches:', error);
                    setFilteredBranches([]);
                    form.setValue('branch_id', '');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setFilteredBranches([]);
            form.setValue('branch_id', '');
        }
    }, [selectedRegionId, form]);

    // Create branch options from filtered branches
    const branchOptions = filteredBranches.map((branch) => ({
        label: branch.name,
        value: branch.id,
    }));

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
                            <FormMessage>{errors.email}</FormMessage>
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

                <FormField
                    control={form.control}
                    name="region_id"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Region</FormLabel>
                            <Popover open={openRegion} onOpenChange={setOpenRegion}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openRegion}
                                            className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                                        >
                                            {field.value ? regionOptions.find((region) => region.value === field.value)?.label : 'Select region'}
                                            <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
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
                                                            setOpenRegion(false);
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

                <FormField
                    control={form.control}
                    name="branch_id"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Branch</FormLabel>
                            <Popover open={openBranch} onOpenChange={setOpenBranch}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openBranch}
                                            disabled={!selectedRegionId || isLoading}
                                            className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                                        >
                                            {isLoading ? 'Loading branches...' : 
                                              field.value ? branchOptions.find((branch) => branch.value === field.value)?.label : 'Select branch'}
                                            <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Search branch..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No branch found.</CommandEmpty>
                                            <CommandGroup>
                                                {branchOptions.map((branch) => (
                                                    <CommandItem
                                                        value={branch.label}
                                                        key={branch.value}
                                                        onSelect={() => {
                                                            form.setValue('branch_id', branch.value);
                                                            setOpenBranch(false);
                                                        }}
                                                    >
                                                        {branch.label}
                                                        <Check
                                                            className={cn('ml-auto', branch.value === field.value ? 'opacity-100' : 'opacity-0')}
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
