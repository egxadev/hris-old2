export interface Branch {
    id: string;
    region_id: string;
    name: string;
    code: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    geofence_radius: number;
}
