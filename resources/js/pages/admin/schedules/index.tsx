import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Schedule } from '@/types/schedule';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { columns } from './partials/data-table';

export default function ScheduleIndex() {
    const { breadcrumbs, data, meta, filters, flash } = usePage<{
        breadcrumbs: BreadcrumbItem[];
        data: Schedule[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            from: number;
            to: number;
        };
        filters: {
            search: string;
            sort_by: string;
            sort_dir: string;
            trashed: boolean;
        };
        flash: {
            success: string;
            error: string;
            warning: string;
            info: string;
        };
    }>().props;
    const [search, setSearch] = React.useState(filters.search);
    const [sorting, setSorting] = React.useState<SortingState>([{ id: filters.sort_by, desc: filters.sort_dir === 'desc' }]);
    const [trashed, setTrashed] = React.useState(filters.trashed || false);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [isInitialRender, setIsInitialRender] = React.useState(true);
    const [flashStatus, setFlashStatus] = React.useState(false);

    // Reset initial render flag
    React.useEffect(() => {
        setIsInitialRender(false);
    }, []);

    // Handle flash messages
    React.useEffect(() => {
        if (!flashStatus) {
            if (flash.success) toast.success(flash.success);
            if (flash.error) toast.error(flash.error);
            if (flash.warning) toast.warning(flash.warning);
            if (flash.info) toast.info(flash.info);
            setFlashStatus(true);
        }
    }, [flash, flashStatus]);

    // Debounce search input
    React.useEffect(() => {
        if (isInitialRender) return;

        const timer = setTimeout(() => {
            handleServerOperation({ search, page: 1 });
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Handle sorting changes
    React.useEffect(() => {
        if (isInitialRender) return;

        if (sorting.length > 0) {
            handleServerOperation({
                sort_by: sorting[0].id,
                sort_dir: sorting[0].desc ? 'desc' : 'asc',
                page: 1,
            });
        }
    }, [sorting]);

    // Handle server-side operations
    const handleServerOperation = (params: {
        page?: number;
        per_page?: number;
        sort_by?: string;
        sort_dir?: string;
        search?: string;
        trashed?: boolean;
    }) => {
        router.get(
            route('admin.schedules.index'),
            {
                ...filters,
                ...params,
                page: params.page || meta.current_page,
                per_page: params.per_page || meta.per_page,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Handle trashed toggle
    const handleTrashedToggle = () => {
        const newTrashed = !trashed;
        setTrashed(newTrashed);
        handleServerOperation({ trashed: newTrashed, page: 1 });
    };

    const table = useReactTable({
        data,
        columns,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: meta.last_page,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        meta: {
            isTrashed: trashed,
        },
        state: {
            sorting,
            pagination: {
                pageIndex: meta.current_page - 1,
                pageSize: meta.per_page,
            },
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <div className="w-full px-4">
                {/* Responsive filter & action bar */}
                <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                        <Input
                            placeholder="Filter names..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="max-w-full sm:max-w-sm"
                        />
                    </div>
                    <div className="flex w-full flex-row gap-1 sm:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Columns <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" onClick={handleTrashedToggle} className="sm:ml-2">
                            {trashed ? 'Show Active' : 'Show Trashed'}
                        </Button>
                        <Link className="w-full sm:w-auto" href={route('admin.schedules.create')}>
                            <Button className="w-full sm:w-auto">Add Schedule</Button>
                        </Link>
                    </div>
                </div>

                {/* Responsive table container */}
                <div className="overflow-x-auto rounded-md border">
                    <Table className="min-w-[600px] text-sm sm:text-base">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="px-2 py-2 text-xs whitespace-nowrap sm:text-sm">
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-2 py-2 text-xs whitespace-nowrap sm:text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Responsive pagination */}
                <div className="flex flex-col items-center justify-between gap-2 py-4 sm:flex-row">
                    <div className="text-xs text-muted-foreground sm:text-sm">
                        Showing {meta.from} to {meta.to} of {meta.total} entries.
                    </div>
                    <div className="w-full sm:w-auto">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={() => {
                                            if (meta.current_page > 1) {
                                                handleServerOperation({ page: meta.current_page - 1 });
                                            }
                                        }}
                                        className={meta.current_page > 1 ? '' : 'cursor-default opacity-50'}
                                    />
                                </PaginationItem>
                                {meta.last_page > 5 ? (
                                    <>
                                        <PaginationItem>
                                            <PaginationLink
                                                href="#"
                                                isActive={meta.current_page === 1}
                                                onClick={() => handleServerOperation({ page: 1 })}
                                            >
                                                1
                                            </PaginationLink>
                                        </PaginationItem>
                                        {meta.current_page > 3 && <PaginationEllipsis />}
                                        {[meta.current_page - 1, meta.current_page, meta.current_page + 1]
                                            .filter((page) => page > 1 && page < meta.last_page)
                                            .map((page) => (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={meta.current_page === page}
                                                        onClick={() => handleServerOperation({ page })}
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                        {meta.current_page < meta.last_page - 2 && <PaginationEllipsis />}
                                        <PaginationItem>
                                            <PaginationLink
                                                href="#"
                                                isActive={meta.current_page === meta.last_page}
                                                onClick={() => handleServerOperation({ page: meta.last_page })}
                                            >
                                                {meta.last_page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    </>
                                ) : (
                                    Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                href="#"
                                                isActive={meta.current_page === page}
                                                onClick={() => handleServerOperation({ page })}
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))
                                )}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={() => {
                                            if (meta.current_page < meta.last_page) {
                                                handleServerOperation({ page: meta.current_page + 1 });
                                            }
                                        }}
                                        className={meta.current_page < meta.last_page ? '' : 'cursor-default opacity-50'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
