'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { Branch } from '@/types/branch';
import { Department } from '@/types/department';
import { Employee } from '@/types/employee';
import { Position } from '@/types/position';
import { Region } from '@/types/region';
import { Role } from '@/types/role';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z
    .object({
        region_id: z.string().min(1, { message: 'Region is required.' }),
        branch_id: z.string().min(1, { message: 'Branch is required.' }),
        department_id: z.string().min(1, { message: 'Department is required.' }),
        position_id: z.string().min(1, { message: 'Position is required.' }),
        employee_code: z.string().min(1, { message: 'Employee code is required.' }),
        employee_type: z.coerce.number().int().min(1, { message: 'Employee type is required.' }),
        employee_status: z.coerce.number().int().min(1, { message: 'Employee status is required.' }),
        joined_at: z.string().min(1, { message: 'Join date is required.' }),
        resigned_at: z.string().optional().nullable(),
        nik: z.string().min(1, { message: 'NIK is required.' }),
        npwp: z.string().optional().nullable(),
        citizenship: z.string().min(1, { message: 'Citizenship is required.' }),
        phone_number: z.string().min(1, { message: 'Phone number is required.' }),
        photo_path: z.string().optional().nullable(),
        address: z.string().min(1, { message: 'Address is required.' }),
        birth_place: z.string().min(1, { message: 'Birth place is required.' }),
        birth_date: z.string().min(1, { message: 'Birth date is required.' }),
        gender: z.coerce.number().int().min(1, { message: 'Gender is required.' }),
        blood_type: z.string().optional().nullable(),
        religion: z.coerce.number().int().min(1, { message: 'Religion is required.' }),
        education: z.string().min(1, { message: 'Education is required.' }),
        user: z
            .object({
                name: z.string().min(1, { message: 'Name is required.' }),
                email: z.string().email({ message: 'Invalid email address.' }).optional(),
                password: z.string().min(8, { message: 'Password must be at least 8 characters.' }).optional().or(z.literal('')),
                password_confirmation: z.string().min(8, { message: 'Confirm Password must be at least 8 characters.' }).optional().or(z.literal('')),
                roles: z.array(z.number()).optional(),
            })
            .optional(),
        mode: z.enum(['create', 'edit']),
    })
    .refine(
        (data) => {
            if (data.mode === 'create' && data.user && (!data.user.password || data.user.password === '')) {
                return false;
            }
            return true;
        },
        {
            message: "Password is required when creating a user account",
            path: ['user.password'],
        }
    )
    .refine(
        (data) => {
            if (data.user?.password && data.user.password !== '' && 
                (!data.user.password_confirmation || data.user.password !== data.user.password_confirmation)) {
                return false;
            }
            return true;
        },
        {
            message: "Passwords don't match",
            path: ['user.password_confirmation'],
        }
    );

export function EmployeeForm({
    mode,
    regions = [],
    branches = [],
    departments = [],
    positions = [],
    roles = [],
    employee,
    className,
}: PageProps<{
    mode: 'create' | 'edit';
    className: string;
    regions?: Region[];
    branches?: Branch[];
    departments?: Department[];
    positions?: Position[];
    roles?: Role[];
    employee?: Employee;
}>) {
    const { errors } = usePage().props;
    const [openRegion, setOpenRegion] = React.useState(false);
    const [openBranch, setOpenBranch] = React.useState(false);
    const [openDepartment, setOpenDepartment] = React.useState(false);
    const [openPosition, setOpenPosition] = React.useState(false);
    const [showUserForm, setShowUserForm] = React.useState(false);

    // State for filtered branches and positions
    const [filteredBranches, setFilteredBranches] = React.useState<Branch[]>([]);
    const [filteredPositions, setFilteredPositions] = React.useState<Position[]>([]);

    // Format date strings for form
    const joinedAt = employee?.joined_at ? employee.joined_at.substring(0, 10) : '';
    const resignedAt = employee?.resigned_at ? employee.resigned_at.substring(0, 10) : '';
    const birthDate = employee?.birth_date
        ? typeof employee.birth_date === 'string'
            ? employee.birth_date.substring(0, 10)
            : format(employee.birth_date, 'yyyy-MM-dd')
        : '';

    // Initialize user form if employee has a user
    React.useEffect(() => {
        if (employee?.user) {
            setShowUserForm(true);
        }
    }, [employee]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            region_id: employee?.region_id || '',
            branch_id: employee?.branch_id || '',
            department_id: employee?.department_id || '',
            position_id: employee?.position_id || '',
            employee_code: employee?.employee_code || '',
            employee_type: employee?.employee_type ? parseInt(employee.employee_type) : undefined,
            employee_status: employee?.employee_status ? parseInt(employee.employee_status) : 1,
            joined_at: joinedAt,
            resigned_at: resignedAt || null,
            nik: employee?.nik || '',
            npwp: employee?.npwp || '',
            citizenship: employee?.citizenship || 'Indonesia',
            phone_number: employee?.phone_number || '',
            photo_path: employee?.photo_path || null,
            address: employee?.address || '',
            birth_place: employee?.birth_place || '',
            birth_date: birthDate,
            gender: employee?.gender || undefined,
            blood_type: employee?.blood_type || '',
            religion: employee?.religion ? parseInt(employee.religion) : undefined,
            education: employee?.education || '',
            user: employee?.user
                ? {
                      name: employee.user.name,
                      email: employee.user.email,
                      password: '',
                      password_confirmation: '',
                      roles: employee.user.roles?.map((role) => role.id) || [],
                  }
                : undefined,
            mode: mode,
        },
    });

    // Create options from data
    const regionOptions = regions.map((region) => ({
        label: region.name,
        value: region.id,
    }));

    const branchOptions = filteredBranches.map((branch) => ({
        label: branch.name,
        value: branch.id,
    }));

    const departmentOptions = departments.map((department) => ({
        label: department.name,
        value: department.id,
    }));

    const positionOptions = filteredPositions.map((position) => ({
        label: position.name,
        value: position.id,
    }));

    // Initialize filtered branches and positions when component mounts
    React.useEffect(() => {
        // For edit mode, initialize with the correct filtered branches
        if (employee?.region_id) {
            const filteredBranches = branches.filter((branch) => branch.region_id === employee.region_id);
            setFilteredBranches(filteredBranches);
        }

        // For edit mode, initialize with the correct filtered positions
        if (employee?.department_id) {
            const filteredPositions = positions.filter((position) => position.department_id === employee.department_id);
            setFilteredPositions(filteredPositions);
        }
    }, [employee, branches, positions]);

    // Watch for changes in region_id and department_id
    const regionId = form.watch('region_id');
    const departmentId = form.watch('department_id');

    // Update filtered branches when region changes
    React.useEffect(() => {
        if (regionId) {
            const filteredBranches = branches.filter((branch) => branch.region_id === regionId);
            setFilteredBranches(filteredBranches);

            // Reset branch selection if the selected branch is not in the filtered list
            const currentBranchId = form.getValues('branch_id');
            const branchExists = filteredBranches.some((branch) => branch.id === currentBranchId);

            if (!branchExists) {
                form.setValue('branch_id', '');
            }
        } else {
            setFilteredBranches([]);
            form.setValue('branch_id', '');
        }
    }, [regionId, branches, form]);

    // Update filtered positions when department changes
    React.useEffect(() => {
        if (departmentId) {
            const filteredPositions = positions.filter((position) => position.department_id === departmentId);
            setFilteredPositions(filteredPositions);

            // Reset position selection if the selected position is not in the filtered list
            const currentPositionId = form.getValues('position_id');
            const positionExists = filteredPositions.some((position) => position.id === currentPositionId);

            if (!positionExists) {
                form.setValue('position_id', '');
            }
        } else {
            setFilteredPositions([]);
            form.setValue('position_id', '');
        }
    }, [departmentId, positions, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const isCreateMode = mode === 'create';
        const url = isCreateMode ? '/admin/employees' : `/admin/employees/${employee?.id}`;

        // Format dates to ISO format for backend
        const formattedValues = {
            ...values,
            birth_date: values.birth_date ? formatDateForSubmission(values.birth_date) : values.birth_date,
            joined_at: values.joined_at ? formatDateForSubmission(values.joined_at) : values.joined_at,
            resigned_at: values.resigned_at ? formatDateForSubmission(values.resigned_at) : values.resigned_at,
        };

        if (isCreateMode) {
            router.post(url, formattedValues);
        } else {
            router.put(url, formattedValues);
        }
    }

    // Format date to YYYY-MM-DD for backend
    const formatDateForSubmission = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    };

    // Toggle user form visibility
    const toggleUserForm = () => {
        setShowUserForm(!showUserForm);

        // Clear user data if hiding the form
        if (showUserForm) {
            form.setValue('user', undefined);
        } else {
            form.setValue('user', {
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                roles: [],
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={`${className} space-y-6`}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Employee Code */}
                    <FormField
                        control={form.control}
                        name="employee_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Employee Code</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage>{errors.employee_code}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Employee Type */}
                    <FormField
                        control={form.control}
                        name="employee_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Employee Type</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select employee type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">Permanent</SelectItem>
                                        <SelectItem value="2">Contract</SelectItem>
                                        <SelectItem value="3">Probation</SelectItem>
                                        <SelectItem value="4">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage>{errors.employee_type}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Region */}
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
                                <FormMessage>{errors.region_id}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Branch (dependent on Region) */}
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
                                                disabled={!regionId}
                                                className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                                            >
                                                {field.value
                                                    ? branchOptions.find((branch) => branch.value === field.value)?.label
                                                    : regionId
                                                      ? 'Select branch'
                                                      : 'Select a region first'}
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
                                <FormMessage>{errors.branch_id}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Department */}
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
                                                {field.value
                                                    ? departmentOptions.find((department) => department.value === field.value)?.label
                                                    : 'Select department'}
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
                                                                className={cn(
                                                                    'ml-auto',
                                                                    department.value === field.value ? 'opacity-100' : 'opacity-0',
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage>{errors.department_id}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Position (dependent on Department) */}
                    <FormField
                        control={form.control}
                        name="position_id"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Position</FormLabel>
                                <Popover open={openPosition} onOpenChange={setOpenPosition}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openPosition}
                                                disabled={!departmentId}
                                                className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                                            >
                                                {field.value
                                                    ? positionOptions.find((position) => position.value === field.value)?.label
                                                    : departmentId
                                                      ? 'Select position'
                                                      : 'Select a department first'}
                                                <ChevronsUpDown className="opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search position..." className="h-9" />
                                            <CommandList>
                                                <CommandEmpty>No position found.</CommandEmpty>
                                                <CommandGroup>
                                                    {positionOptions.map((position) => (
                                                        <CommandItem
                                                            value={position.label}
                                                            key={position.value}
                                                            onSelect={() => {
                                                                form.setValue('position_id', position.value);
                                                                setOpenPosition(false);
                                                            }}
                                                        >
                                                            {position.label}
                                                            <Check
                                                                className={cn(
                                                                    'ml-auto',
                                                                    position.value === field.value ? 'opacity-100' : 'opacity-0',
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage>{errors.position_id}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* NIK */}
                    <FormField
                        control={form.control}
                        name="nik"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NIK</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage>{errors.nik}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* NPWP */}
                    <FormField
                        control={form.control}
                        name="npwp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NPWP (Optional)</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage>{errors.npwp}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Birth Place */}
                    <FormField
                        control={form.control}
                        name="birth_place"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Birth Place</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage>{errors.birth_place}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Birth Date */}
                    <FormField
                        control={form.control}
                        name="birth_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Birth Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                            >
                                                {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            disabled={(date: Date) => date > new Date() || date < new Date('1900-01-01')}
                                            captionLayout="dropdown"
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage>{errors.birth_date}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Gender */}
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">Male</SelectItem>
                                        <SelectItem value="2">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage>{errors.gender}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Religion */}
                    <FormField
                        control={form.control}
                        name="religion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Religion</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select religion" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">Islam</SelectItem>
                                        <SelectItem value="2">Christianity</SelectItem>
                                        <SelectItem value="3">Catholicism</SelectItem>
                                        <SelectItem value="4">Hinduism</SelectItem>
                                        <SelectItem value="5">Buddhism</SelectItem>
                                        <SelectItem value="6">Confucianism</SelectItem>
                                        <SelectItem value="7">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage>{errors.religion}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Education */}
                    <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Education</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select education" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="SD">SD</SelectItem>
                                        <SelectItem value="SMP">SMP</SelectItem>
                                        <SelectItem value="SMA/SMK">SMA/SMK</SelectItem>
                                        <SelectItem value="D1">D1</SelectItem>
                                        <SelectItem value="D2">D2</SelectItem>
                                        <SelectItem value="D3">D3</SelectItem>
                                        <SelectItem value="D4">D4</SelectItem>
                                        <SelectItem value="S1">S1</SelectItem>
                                        <SelectItem value="S2">S2</SelectItem>
                                        <SelectItem value="S3">S3</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage>{errors.education}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Joined Date */}
                    <FormField
                        control={form.control}
                        name="joined_at"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Join Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                            >
                                                {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            disabled={(date: Date) => date > new Date() || date < new Date('1900-01-01')}
                                            captionLayout="dropdown"
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage>{errors.joined_at}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Resigned Date */}
                    <FormField
                        control={form.control}
                        name="resigned_at"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Resignation Date (Optional)</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                            >
                                                {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            disabled={(date: Date) => date < new Date('1900-01-01')}
                                            captionLayout="dropdown"
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage>{errors.resigned_at}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Phone Number */}
                    <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage>{errors.phone_number}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Citizenship */}
                    <FormField
                        control={form.control}
                        name="citizenship"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Citizenship</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage>{errors.citizenship}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Blood Type */}
                    <FormField
                        control={form.control}
                        name="blood_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Blood Type (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select blood type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="AB">AB</SelectItem>
                                        <SelectItem value="O">O</SelectItem>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage>{errors.blood_type}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Employee Status */}
                    <FormField
                        control={form.control}
                        name="employee_status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Employee Status</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select employee status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">Active</SelectItem>
                                        <SelectItem value="2">Inactive</SelectItem>
                                        <SelectItem value="3">On Leave</SelectItem>
                                        <SelectItem value="4">Resigned</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage>{errors.employee_status}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Address */}
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={3} />
                            </FormControl>
                            <FormMessage>{errors.address}</FormMessage>
                        </FormItem>
                    )}
                />

                {/* User Account Section */}
                <div className="border-t pt-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-medium">User Account</h3>
                        <Button type="button" variant="outline" onClick={toggleUserForm}>
                            {showUserForm ? 'Remove User Account' : 'Add User Account'}
                        </Button>
                    </div>

                    {showUserForm && (
                        <div className="space-y-6 rounded-md border p-4">
                            {/* User Name */}
                            <FormField
                                control={form.control}
                                name="user.name"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                    <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage>{errors['user.name']}</FormMessage>
                                </FormItem>
                                )}
                            />

                            {/* User Email */}
                            <FormField
                                control={form.control}
                                name="user.email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage>{errors['user.email']}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* User Password */}
                            <FormField
                                control={form.control}
                                name="user.password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{mode === 'edit' ? 'New Password (leave blank to keep current)' : 'Password'}</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage>{errors['user.password']}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* User Password Confirmation */}
                            <FormField
                                control={form.control}
                                name="user.password_confirmation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage>{errors['user.password_confirmation']}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* User Roles */}
                            <FormField
                                control={form.control}
                                name="user.roles"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="mb-4">
                                            <FormLabel className="text-base">Roles</FormLabel>
                                            <FormDescription>Select roles for this user</FormDescription>
                                        </div>
                                        {roles.map((role) => (
                                            <FormItem key={role.id} className="flex flex-row items-start space-y-0 space-x-3">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={(field.value ?? []).includes(role.id)}
                                                        onCheckedChange={(checked) => {
                                                            const currentValues = Array.isArray(field.value) ? field.value : [];
                                                            field.onChange(
                                                                checked
                                                                    ? [...currentValues, role.id]
                                                                    : currentValues.filter((value) => value !== role.id),
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal">{role.name}</FormLabel>
                                            </FormItem>
                                        ))}
                                        <FormMessage>{errors['user.roles']}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>

                <Button type="submit">{mode === 'create' ? 'Create Employee' : 'Update Employee'}</Button>
            </form>
        </Form>
    );
}
