import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PageProps } from '@/types';
import { Schedule } from '@/types/schedule';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface EmployeeOption {
    id: string;
    name: string;
}

interface ShiftOption {
    id: string;
    name: string;
}

const formSchema = z
    .object({
        employee_id: z.string().min(1, { message: 'Employee is required.' }),
        shift_id: z.string().min(1, { message: 'Shift is required.' }),
        date: z.string().min(1, { message: 'Date is required.' }),
    })

export function ScheduleForm({
    mode,
    schedule,
    employees,
    shifts,
    className,
}: PageProps<{
    mode: 'create' | 'edit';
    schedule?: Schedule;
    employees: EmployeeOption[];
    shifts: ShiftOption[];
    className: string;
}>) {
    const { errors } = usePage().props;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employee_id: schedule?.employee_id || '',
            shift_id: schedule?.shift_id || '',
            date: schedule?.date ? new Date(schedule.date).toISOString().split('T')[0] : '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const isCreateMode = mode === 'create';
        const url = isCreateMode ? '/admin/schedules' : `/admin/schedules/${schedule?.id}`;

        if (isCreateMode) {
            router.post(url, values, {
                onSuccess: () => {
                    console.log('Schedule created successfully.');
                },
                onError: () => {
                    console.error('Failed to create schedule.');
                },
            });
        } else {
            router.put(url, values, {
                onSuccess: () => {
                    console.log('Schedule updated successfully.');
                },
                onError: () => {
                    console.error('Failed to update schedule.');
                },
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={`${className} space-y-8`}>
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
                    name="shift_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shift</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a shift" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {shifts.map((shift) => (
                                        <SelectItem key={shift.id} value={shift.id}>
                                            {shift.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage>{errors.shift_id}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
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
                                <FormMessage>{errors.date}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* <FormField
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
                    /> */}

                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
