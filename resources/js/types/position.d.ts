import { Department } from "./department";

export interface Position {
    id: string;
    department_id: string;
    name: string;
    code: string;
    department?: Department;
}
