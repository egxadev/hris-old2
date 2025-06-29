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
import { Shift } from '@/types/shift';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export const columns: ColumnDef<Shift>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'start_time',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Start Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'end_time',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    End Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'is_night_shift',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Night Shift
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => <div>{row.getValue('is_night_shift') ? 'Yes' : 'No'}</div>,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const data = row.original;

            return <ActionCell data={data} />;
        },
    },
];

const ActionCell = ({ data }: { data: Shift }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    function handleDelete() {
        router.delete(route('admin.shifts.destroy', data.id), {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setIsDropdownOpen(false);
                console.log('Shift deleted successfully.');
            },
            onError: () => {
                setIsDropdownOpen(false);
                console.error('Failed to delete shift.');
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

                {hasAnyPermission(['admin.shifts.edit']) && (
                    <Link href={route('admin.shifts.edit', data.id)}>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                    </Link>
                )}

                {hasAnyPermission(['admin.shifts.delete']) && (
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
