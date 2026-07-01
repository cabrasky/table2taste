import { Group } from "./Group";

export interface User {
    id: string;
    name: string;
    photoUrl: string;
    groups: Partial<Group>[]
}
