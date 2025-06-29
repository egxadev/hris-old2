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
import { Attendance } from '@/types/attendance';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export const columns: ColumnDef<Attendance>[] = [
    {
        accessorKey: 'employee_name',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Employee
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const attendance = row.original;
            return <div>{attendance.employee?.user?.name || 'N/A'}</div>;
        },
    },
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
    },
    {
        accessorKey: 'check_in_time',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Check In
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'check_out_time',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Check Out
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const data = row.original;

            return <ActionCell data={data} />;
        },
    },
];

const ActionCell = ({ data }: { data: Attendance }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    function handleDelete() {
        router.delete(route('admin.attendances.destroy', data.id), {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setIsDropdownOpen(false);
                console.log('Attendance deleted successfully.');
            },
            onError: () => {
                setIsDropdownOpen(false);
                console.error('Failed to delete attendance.');
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

                {hasAnyPermission(['admin.attendances.edit']) && (
                    <Link href={route('admin.attendances.edit', data.id)}>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                    </Link>
                )}

                {hasAnyPermission(['admin.attendances.delete']) && (
                    <AlertDialog>
                        <AlertDialogTrigger className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
                            Delete
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete()}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
