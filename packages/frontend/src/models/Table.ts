import { Service } from "./Service";

export interface Table {
    id: number;
    capacity: number;
    lastService: Service;
}
