import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageProps } from '@/types';
import { Attendance } from '@/types/attendance';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface EmployeeOption {
    id: string;
    name: string;
}

const formSchema = z.object({
    employee_id: z.string().min(1, { message: 'Employee is required.' }),
    date: z.string().min(1, { message: 'Date is required.' }),
    check_in_time: z.string().optional(),
    check_in_location: z.string().optional(),
    check_out_time: z.string().optional(),
    check_out_location: z.string().optional(),
    status: z.enum(['present', 'absent', 'late', 'early_out', 'on_leave', 'sick', 'overtime', 'no_check_out']),
    notes: z.string().optional(),
});

export function AttendanceForm({
    mode,
    attendance,
    employees,
    className,
}: PageProps<{
    mode: 'create' | 'edit';
    attendance?: Attendance;
    employees: EmployeeOption[];
    className: string;
}>) {
    const { errors } = usePage().props;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employee_id: attendance?.employee_id || '',
            date: attendance?.date || new Date().toISOString().split('T')[0],
            check_in_time: attendance?.check_in_time || '',
            check_in_location: attendance?.check_in_location || '',
            check_out_time: attendance?.check_out_time || '',
            check_out_location: attendance?.check_out_location || '',
            status: (attendance?.status as z.infer<typeof formSchema>['status']) || 'present',
            notes: attendance?.notes || '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const isCreateMode = mode === 'create';
        const url = isCreateMode ? '/admin/attendances' : `/admin/attendances/${attendance?.id}`;

        if (isCreateMode) {
            router.post(url, values, {
                onSuccess: () => {
                    console.log('Attendance created successfully.');
                },
                onError: () => {
                    console.error('Failed to create attendance.');
                },
            });
        } else {
            router.put(url, values, {
                onSuccess: () => {
                    console.log('Attendance updated successfully.');
                },
                onError: () => {
                    console.error('Failed to update attendance.');
                },
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={`${className} space-y-6`}>
                <FormField
                    control={form.control}
                    name="employee_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Employee</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an employee" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {employees.map((employee) => (
                                        <SelectItem key={employee.id} value={employee.id}>
                                            {employee.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage>{errors.employee_id}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage>{errors.date}</FormMessage>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="check_in_time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Check In Time</FormLabel>
                                <FormControl>
                                    <Input type="time" step="1" {...field} />
                                </FormControl>
                                <FormMessage>{errors.check_in_time}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="check_in_location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Check In Location</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage>{errors.check_in_location}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="check_out_time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Check Out Time</FormLabel>
                                <FormControl>
                                    <Input type="time" step="1" {...field} />
                                </FormControl>
                                <FormMessage>{errors.check_out_time}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="check_out_location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Check Out Location</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage>{errors.check_out_location}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                                <Select 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="present">Present</SelectItem>
                                        <SelectItem value="absent">Absent</SelectItem>
                                        <SelectItem value="late">Late</SelectItem>
                                        <SelectItem value="early_out">Early Out</SelectItem>
                                        <SelectItem value="on_leave">On Leave</SelectItem>
                                        <SelectItem value="sick">Sick</SelectItem>
                                        <SelectItem value="overtime">Overtime</SelectItem>
                                        <SelectItem value="no_check_out">No Check Out</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage>{errors.status}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage>{errors.notes}</FormMessage>
                        </FormItem>
                    )}
                />

                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
