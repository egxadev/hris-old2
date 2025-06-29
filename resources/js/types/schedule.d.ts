import { Employee } from './employee';
import { Shift } from './shift';

export interface Schedule {
    id: string;
    employee_id: string;
    shift_id: string;
    date: string;
    employee?: Employee;
    shift?: Shift;
} 