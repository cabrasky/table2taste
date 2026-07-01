import { Translation } from "./Translation";

export interface Allergen {
    id: string;
    mediaUrl: string;
    translations: Translation[];
}