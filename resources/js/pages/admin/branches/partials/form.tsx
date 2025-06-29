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
    latitude: z.string().optional()
        .transform(val => val === '' ? null : parseFloat(val || '0'))
        .refine(val => val === null || (val !== null && val >= -90 && val <= 90), {
            message: 'Latitude must be between -90 and 90 degrees',
        }),
    longitude: z.string().optional()
        .transform(val => val === '' ? null : parseFloat(val || '0'))
        .refine(val => val === null || (val !== null && val >= -180 && val <= 180), {
            message: 'Longitude must be between -180 and 180 degrees',
        }),
    geofence_radius: z.string().optional()
        .transform(val => val === '' ? 100 : parseInt(val || '100'))
        .refine(val => val >= 10 && val <= 1000, {
            message: 'Geofence radius must be between 10 and 1000 meters',
        }),
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
    const [openRegion, setOpenRegion] = React.useState(false);

    const regionOptions = regions.map((region) => ({
        label: region.name,
        value: region.id,
    }));

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            region_id: branch?.region_id || '',
            name: branch?.name || '',
            code: branch?.code || '',
            address: branch?.address || '',
            latitude: branch?.latitude !== null ? String(branch?.latitude) : '',
            longitude: branch?.longitude !== null ? String(branch?.longitude) : '',
            geofence_radius: branch?.geofence_radius !== undefined ? String(branch?.geofence_radius) : '100',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const isCreateMode = mode === 'create';
        const url = isCreateMode ? '/admin/branches' : `/admin/branches/${branch?.id}`;

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

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Latitude</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        step="0.0000001" 
                                        placeholder="e.g. -6.2088" 
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage>{errors.latitude}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Longitude</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        step="0.0000001" 
                                        placeholder="e.g. 106.8456" 
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage>{errors.longitude}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="geofence_radius"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Geofence Radius (meters)</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    min="10" 
                                    max="1000" 
                                    placeholder="Default: 100 meters" 
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage>{errors.geofence_radius}</FormMessage>
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

                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
