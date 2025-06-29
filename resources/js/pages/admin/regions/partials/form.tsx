import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PageProps } from '@/types';
import { Region } from '@/types/region';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z
    .object({
        name: z.string().min(2, { message: 'Region name must be at least 2 characters.' }),
        code: z.string().min(2, { message: 'Region code must be at least 2 characters.' }),
    })

export function RegionForm({
    mode,
    region,
    className,
}: PageProps<{
    mode: 'create' | 'edit';
    region?: Region;
    className: string;
}>) {
    const { errors } = usePage().props;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: region?.name,
            code: region?.code,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const isCreateMode = mode === 'create';
        const url = isCreateMode ? '/admin/regions' : `/admin/regions/${region?.id}`;

        if (isCreateMode) {
            router.post(url, values, {
                onSuccess: () => {
                    console.log('Region created successfully.');
                },
                onError: () => {
                    console.error('Failed to create region.');
                },
            });
        } else {
            router.put(url, values, {
                onSuccess: () => {
                    console.log('Region updated successfully.');
                },
                onError: () => {
                    console.error('Failed to update region.');
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
                            <FormLabel>Code Region</FormLabel>
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
                            <FormLabel>Region Name</FormLabel>
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
