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
import { Position } from '@/types/position';
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
    department_id: z.string().min(1, { message: 'Department is required.' }),
    name: z.string().min(2, { message: 'Position name must be at least 2 characters.' }),
    code: z.string().min(2, { message: 'Position code must be at least 2 characters.' }),
});

export function PositionForm({
    mode,
    regions,
    branches = [],
    departments = [],
    position,
    className,
}: PageProps<{
    mode: 'create' | 'edit';
    className: string;
    regions: Region[];
    branches?: Branch[];
    departments?: Department[];
    position?: Position;
}>) {
    const { errors } = usePage().props;
    const [openRegion, setOpenRegion] = React.useState(false);
    const [openBranch, setOpenBranch] = React.useState(false);
    const [openDepartment, setOpenDepartment] = React.useState(false);
    
    const [filteredBranches, setFilteredBranches] = React.useState<Branch[]>(mode === 'edit' ? branches : []);
    const [filteredDepartments, setFilteredDepartments] = React.useState<Department[]>(mode === 'edit' ? departments : []);
    
    const [isLoadingBranches, setIsLoadingBranches] = React.useState(false);
    const [isLoadingDepartments, setIsLoadingDepartments] = React.useState(false);

    // Get initial values for edit mode
    const initialRegionId = position?.department?.branch?.region_id || '';
    const initialBranchId = position?.department?.branch_id || '';
    const initialDepartmentId = position?.department_id || '';

    const regionOptions = regions.map((region) => ({
        label: region.name,
        value: region.id,
    }));

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            region_id: initialRegionId,
            branch_id: initialBranchId,
            department_id: initialDepartmentId,
            name: position?.name || '',
            code: position?.code || '',
        },
    });

    // Watch for region_id changes to filter branches
    const selectedRegionId = form.watch('region_id');
    const selectedBranchId = form.watch('branch_id');

    // Load initial branches and departments for edit mode
    React.useEffect(() => {
        if (mode === 'edit' && initialRegionId && initialBranchId && branches.length === 0) {
            // Fetch branches for the selected region
            axios.get(`/api/regions/${initialRegionId}/branches`)
                .then(response => {
                    setFilteredBranches(response.data);
                })
                .catch(error => {
                    console.error('Error fetching initial branches:', error);
                });
        }
    }, [mode, initialRegionId, initialBranchId, branches.length]);

    React.useEffect(() => {
        if (mode === 'edit' && initialBranchId && initialDepartmentId && departments.length === 0) {
            // Fetch departments for the selected branch
            axios.get(`/api/branches/${initialBranchId}/departments`)
                .then(response => {
                    setFilteredDepartments(response.data);
                })
                .catch(error => {
                    console.error('Error fetching initial departments:', error);
                });
        }
    }, [mode, initialBranchId, initialDepartmentId, departments.length]);

    // Fetch branches when region changes
    React.useEffect(() => {
        if (selectedRegionId) {
            setIsLoadingBranches(true);
            // Fetch branches for the selected region from API
            axios.get(`/api/regions/${selectedRegionId}/branches`)
                .then(response => {
                    setFilteredBranches(response.data);
                    
                    // Reset branch_id if the selected branch is not in the filtered list
                    const currentBranchId = form.getValues('branch_id');
                    if (currentBranchId && !response.data.some((branch: Branch) => branch.id === currentBranchId)) {
                        form.setValue('branch_id', '');
                        form.setValue('department_id', '');
                    }
                })
                .catch(error => {
                    console.error('Error fetching branches:', error);
                    setFilteredBranches([]);
                    form.setValue('branch_id', '');
                    form.setValue('department_id', '');
                })
                .finally(() => {
                    setIsLoadingBranches(false);
                });
        } else {
            setFilteredBranches([]);
            form.setValue('branch_id', '');
            form.setValue('department_id', '');
        }
    }, [selectedRegionId, form]);

    // Fetch departments when branch changes
    React.useEffect(() => {
        if (selectedBranchId) {
            setIsLoadingDepartments(true);
            // Fetch departments for the selected branch from API
            axios.get(`/api/branches/${selectedBranchId}/departments`)
                .then(response => {
                    setFilteredDepartments(response.data);
                    
                    // Reset department_id if the selected department is not in the filtered list
                    const currentDepartmentId = form.getValues('department_id');
                    if (currentDepartmentId && !response.data.some((department: Department) => department.id === currentDepartmentId)) {
                        form.setValue('department_id', '');
                    }
                })
                .catch(error => {
                    console.error('Error fetching departments:', error);
                    setFilteredDepartments([]);
                    form.setValue('department_id', '');
                })
                .finally(() => {
                    setIsLoadingDepartments(false);
                });
        } else {
            setFilteredDepartments([]);
            form.setValue('department_id', '');
        }
    }, [selectedBranchId, form]);

    // Create options from filtered data
    const branchOptions = filteredBranches.map((branch) => ({
        label: branch.name,
        value: branch.id,
    }));

    const departmentOptions = filteredDepartments.map((department) => ({
        label: department.name,
        value: department.id,
    }));

    function onSubmit(values: z.infer<typeof formSchema>) {
        const isCreateMode = mode === 'create';
        const url = isCreateMode ? '/positions' : `/positions/${position?.id}`;

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
                                            disabled={!selectedRegionId || isLoadingBranches}
                                            className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                                        >
                                            {isLoadingBranches ? 'Loading branches...' : 
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
                                            disabled={!selectedBranchId || isLoadingDepartments}
                                            className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                                        >
                                            {isLoadingDepartments ? 'Loading departments...' : 
                                              field.value ? departmentOptions.find((department) => department.value === field.value)?.label : 'Select department'}
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
