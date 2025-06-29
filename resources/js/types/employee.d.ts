import { User } from './user';
import { Branch } from './branch';
import { Department } from './department';
import { Position } from './position';

export interface Employee {
    id: string;
    user_id?: string;
    region_id: string;
    branch_id: string;
    department_id: string;
    position_id: string;
    employee_code: string;
    employee_type: string;
    employee_status: string;
    joined_at: string;
    resigned_at: string | null;
    nik: string;
    npwp: string | null;
    citizenship: string;
    phone_number: string;
    photo_path: string | null;
    address: string;
    birth_place: string;
    birth_date: string | Date;
    gender: number;
    blood_type: string | null;
    religion: string;
    education: string;
    created_by: string;
    updated_by: string;
    deleted_by: string;
    user?: User;
    branch?: Branch;
    department?: Department;
    position?: Position;
}
