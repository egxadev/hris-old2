import { Branch } from "./branch";

export interface Department {
    id: string;
    branch_id: string;
    name: string;
    code: string;
    branch?: Branch
}
