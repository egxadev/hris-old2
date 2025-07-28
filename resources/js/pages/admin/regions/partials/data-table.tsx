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
import { Region } from '@/types/region';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export const columns: ColumnDef<Region>[] = [
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
        id: 'actions',
        cell: ({ row, table }) => {
            const data = row.original;
            const isTrashed = (table.options.meta as { isTrashed?: boolean })?.isTrashed || false;

            return <ActionCell data={data} isTrashed={isTrashed} />;
        },
    },
];

const ActionCell = ({ data, isTrashed = false }: { data: Region; isTrashed?: boolean }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    function handleDelete() {
        router.delete(route('admin.regions.destroy', data.id), {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setIsDropdownOpen(false);
                console.log('Region deleted successfully.');
            },
            onError: () => {
                setIsDropdownOpen(false);
                console.error('Failed to delete region.');
            },
        });
    }

    function handleRestore() {
        router.patch(
            route('admin.regions.restore', data.id),
            {},
            {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    setIsDropdownOpen(false);
                    console.log('Region restored successfully.');
                },
                onError: () => {
                    setIsDropdownOpen(false);
                    console.error('Failed to restore region.');
                },
            },
        );
    }

    function handleForceDelete() {
        router.delete(route('admin.regions.force-delete', data.id), {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setIsDropdownOpen(false);
                console.log('Region permanently deleted successfully.');
            },
            onError: () => {
                setIsDropdownOpen(false);
                console.error('Failed to permanently delete region.');
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
                        {hasAnyPermission(['admin.regions.edit']) && (
                            <Link href={route('admin.regions.edit', data.id)}>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                            </Link>
                        )}

                        {hasAnyPermission(['admin.regions.delete']) && (
                            <AlertDialog>
                                <AlertDialogTrigger className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                    Delete
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This will move the region to trash. You can restore it later.</AlertDialogDescription>
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
                        {hasAnyPermission(['admin.regions.delete']) && (
                            <AlertDialog>
                                <AlertDialogTrigger className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                    Restore
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Restore Region</AlertDialogTitle>
                                        <AlertDialogDescription>This will restore the region and make it available again.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRestore()}>Restore</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                        {/* {hasAnyPermission(['admin.regions.delete']) && (
                            <AlertDialog>
                                <AlertDialogTrigger className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                    Permanently Delete
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Permanently Delete Region</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the region from our servers.
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
