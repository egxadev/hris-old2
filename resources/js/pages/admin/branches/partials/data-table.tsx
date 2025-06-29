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
import { Branch } from '@/types/branch';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export const columns: ColumnDef<Branch>[] = [
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
        accessorKey: 'region',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Region
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'code',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Code
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => <div>{row.getValue('code')}</div>,
    },
    {
        accessorKey: 'address',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Address
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => <div>{row.getValue('address')}</div>,
    },
    {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => {
            const latitude = row.original.latitude;
            const longitude = row.original.longitude;
            const radius = row.original.geofence_radius || 100;
            
            if (latitude === null || longitude === null) {
                return <div className="text-gray-400">Not set</div>;
            }
            
            return (
                <div>
                    <div>{latitude}, {longitude}</div>
                    <div className="text-xs text-gray-500">Radius: {radius}m</div>
                    <a 
                        href={`https://maps.google.com/?q=${latitude},${longitude}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-xs"
                    >
                        View on map
                    </a>
                </div>
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

const ActionCell = ({ data }: { data: Branch }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    function handleDelete() {
        router.delete(route('admin.branches.destroy', data.id), {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setIsDropdownOpen(false);
                console.log('Branch deleted successfully.');
            },
            onError: () => {
                setIsDropdownOpen(false);
                console.error('Failed to delete branch.');
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

                {hasAnyPermission(['admin.branches.edit']) && (
                    <Link href={route('admin.branches.edit', data.id)}>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                    </Link>
                )}

                {hasAnyPermission(['admin.branches.delete']) && (
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
