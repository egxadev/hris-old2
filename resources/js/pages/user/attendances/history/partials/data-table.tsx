import { Button } from '@/components/ui/button';
import { Attendance } from '@/types/attendance';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export const columns: ColumnDef<Attendance>[] = [
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
        header: 'Check-in Time',
    },
    {
        accessorKey: 'check_in_photo',
        header: 'Check-in Photo',
        cell: ({ row }) => {
            const photo = row.original.check_in_photo;
            return photo ? (
                <img 
                    src={photo} 
                    alt="Check-in Photo" 
                    className="h-16 w-16 object-cover rounded-md" 
                />
            ) : (
                <span className="text-gray-400">No photo</span>
            );
        },
    },
    {
        accessorKey: 'check_out_time',
        header: 'Check-out Time',
    },
    {
        accessorKey: 'check_out_photo',
        header: 'Check-out Photo',
        cell: ({ row }) => {
            const photo = row.original.check_out_photo;
            return photo ? (
                <img 
                    src={photo} 
                    alt="Check-out Photo" 
                    className="h-16 w-16 object-cover rounded-md" 
                />
            ) : (
                <span className="text-gray-400">No photo</span>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
    }
];
