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
import { Employee } from '@/types/employee';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export const columns: ColumnDef<Employee>[] = [
    {
        accessorKey: 'employee_code',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Employee Code
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'user',
        header: 'Employee Name',
        cell: ({ row }) => {
            const user = row.original.user;
            return <div>{user?.name || '-'}</div>;
        },
    },
    {
        accessorKey: 'branch',
        header: 'Branch',
        cell: ({ row }) => {
            const branch = row.original.branch;
            return <div>{branch?.name || '-'}</div>;
        },
    },
    {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => {
            const department = row.original.department;
            return <div>{department?.name || '-'}</div>;
        },
    },
    {
        accessorKey: 'position',
        header: 'Position',
        cell: ({ row }) => {
            const position = row.original.position;
            return <div>{position?.name || '-'}</div>;
        },
    },
    {
        accessorKey: 'joined_at',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Join Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const joined_at = row.original.joined_at;
            return <div>{joined_at ? new Date(joined_at).toLocaleDateString() : '-'}</div>;
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

const ActionCell = ({ data }: { data: Employee }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    function handleDelete() {
        router.delete(route('admin.employees.destroy', data.id), {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setIsDropdownOpen(false);
                console.log('Employee deleted successfully.');
            },
            onError: () => {
                setIsDropdownOpen(false);
                console.error('Failed to delete employee.');
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

                {hasAnyPermission(['admin.employees.edit']) && (
                    <Link href={route('admin.employees.edit', data.id)}>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                    </Link>
                )}

                {hasAnyPermission(['admin.employees.delete']) && (
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
