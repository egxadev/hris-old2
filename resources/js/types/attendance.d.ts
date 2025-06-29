import { User } from './user';
import { Department } from './department';
import { Position } from './position';
import { Employee } from './employee';

export interface Attendance {
    id: string;
    employee_id: string;
    date: string;
    check_in_time: string | null;
    check_in_location: string | null;
    check_in_photo: string | null;
    check_out_time: string | null;
    check_out_location: string | null;
    check_out_photo: string | null;
    status: string;
    notes: string | null;
    worked_minutes: number | null;
    created_by: string | null;
    updated_by: string | null;
    deleted_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    employee: Employee & {
        user: User;
        department?: Department;
        position?: Position;
    };
}