export interface Shift {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    grace_period_in: number;
    grace_period_out: number;
    is_night_shift: boolean;
} 