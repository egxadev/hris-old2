import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import hasAnyPermission from '@/lib/utils';
import { Schedule } from '@/types/schedule';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export const columns: ColumnDef<Schedule>[] = [
    {
        accessorKey: 'date',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = row.getValue('date') as string;
            return <div>{format(new Date(date), 'dd MMM yyyy')}</div>;
        },
    },
    {
        accessorKey: 'employee',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Employee
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const employee = row.original.employee;
            return <div>{employee?.user?.name || 'N/A'}</div>;
        },
    },
    {
        accessorKey: 'shift',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Shift
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const shift = row.original.shift;
            return <div>{shift?.name}</div>;
        },
    },
    {
        id: 'actions',
        cell: ({ row, table }) => {
            const data = row.original;
            const isTrashed = (table.options.meta as { isTrashed?: boolean })?.isTrashed || false;

            return <ActionCell data={data} isTrashed={isTrashed} />;
        },
    },
];

const ActionCell = ({ data, isTrashed = false }: { data: Schedule; isTrashed?: boolean }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    function handleDelete() {
        router.delete(route('admin.schedules.destroy', data.id), {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setIsDropdownOpen(false);
                console.log('Schedule deleted successfully.');
            },
            onError: () => {
                setIsDropdownOpen(false);
                console.error('Failed to delete schedule.');
            },
        });
    }

    function handleRestore() {
        router.patch(
            route('admin.schedules.restore', data.id),
            {},
            {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    setIsDropdownOpen(false);
                    console.log('Schedule restored successfully.');
                },
                onError: () => {
                    setIsDropdownOpen(false);
                    console.error('Failed to restore schedule.');
                },
            },
        );
    }

    function handleForceDelete() {
        router.delete(route('admin.schedules.force-delete', data.id), {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setIsDropdownOpen(false);
                console.log('Schedule permanently deleted successfully.');
            },
            onError: () => {
                setIsDropdownOpen(false);
                console.error('Failed to permanently delete schedule.');
            },
        });
    }

    return (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {!isTrashed ? (
                    <>
                        {hasAnyPermission(['admin.schedules.edit']) && (
                            <Link href={route('admin.schedules.edit', data.id)}>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                            </Link>
                        )}

                        {hasAnyPermission(['admin.schedules.delete']) && (
                            <AlertDialog>
                                <AlertDialogTrigger className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                    Delete
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will move the schedule to trash. You can restore it later.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete()}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </>
                ) : (
                    <>
                        {hasAnyPermission(['admin.schedules.delete']) && (
                            <AlertDialog>
                                <AlertDialogTrigger className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                    Restore
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Restore Schedule</AlertDialogTitle>
                                        <AlertDialogDescription>This will restore the schedule and make it available again.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRestore()}>Restore</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                        {/* {hasAnyPermission(['admin.schedules.delete']) && (
                            <AlertDialog>
                                <AlertDialogTrigger className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                    Permanently Delete
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Permanently Delete Schedule</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the schedule from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleForceDelete()} className="bg-red-600 hover:bg-red-700">
                                            Permanently Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )} */}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
