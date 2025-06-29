import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PageProps } from '@/types';
import { Shift } from '@/types/shift';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z
    .object({
        name: z.string().min(2, { message: 'Shift name must be at least 2 characters.' }),
        start_time: z.string().min(1, { message: 'Start time is required.' }),
        end_time: z.string().min(1, { message: 'End time is required.' }),
        grace_period_in: z.coerce.number().int().min(0, { message: 'Grace period must be a non-negative number.' }),
        grace_period_out: z.coerce.number().int().min(0, { message: 'Grace period must be a non-negative number.' }),
        is_night_shift: z.boolean().default(false),
    })

export function ShiftForm({
    mode,
    shift,
    className,
}: PageProps<{
    mode: 'create' | 'edit';
    shift?: Shift;
    className: string;
}>) {
    const { errors } = usePage().props;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: shift?.name || '',
            start_time: shift?.start_time || '',
            end_time: shift?.end_time || '',
            grace_period_in: shift?.grace_period_in || 0,
            grace_period_out: shift?.grace_period_out || 0,
            is_night_shift: shift?.is_night_shift || false,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const isCreateMode = mode === 'create';
        const url = isCreateMode ? '/admin/shifts' : `/admin/shifts/${shift?.id}`;

        if (isCreateMode) {
            router.post(url, values, {
                onSuccess: () => {
                    console.log('Shift created successfully.');
                },
                onError: () => {
                    console.error('Failed to create shift.');
                },
            });
        } else {
            router.put(url, values, {
                onSuccess: () => {
                    console.log('Shift updated successfully.');
                },
                onError: () => {
                    console.error('Failed to update shift.');
                },
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={`${className} space-y-8`}>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shift Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage>{errors.name}</FormMessage>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="start_time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage>{errors.start_time}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="end_time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage>{errors.end_time}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="grace_period_in"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Grace Period In (minutes)</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormMessage>{errors.grace_period_in}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="grace_period_out"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Grace Period Out (minutes)</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormMessage>{errors.grace_period_out}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="is_night_shift"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Night Shift</FormLabel>
                            </div>
                            <FormMessage>{errors.is_night_shift}</FormMessage>
                        </FormItem>
                    )}
                />

                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
