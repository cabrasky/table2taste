import { Allergen } from "./Allergen";
import { Category } from "./Category";
import { Translation } from "./Translation";

export interface MenuItem {
    id: string;
    price: number;
    mediaUrl: string;
    translations: Partial<Translation>[];
    category?: Partial<Category> | null;
    allergens: Partial<Allergen>[]
    categoryId?: string;
    menuPriority: number;
}