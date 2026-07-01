import { Privilege } from "./Privilege";

export interface Group {
    id: string;
    color: string;
    privileges: Partial<Privilege>[]
}

