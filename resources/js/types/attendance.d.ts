export interface Attendance {
    id: string;
    employee_id: string;
    date: string;
    check_in_time: string;
    check_in_location: string;
    check_in_photo: string;
    check_out_time: string;
    check_out_location: string;
    check_out_photo: string;
    status: string;
    notes: string;
    employee?: {
        id: string;
        employee_code?: string;
        user?: {
            id: string;
            name: string;
        };
    };
}