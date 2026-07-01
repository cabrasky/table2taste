import { MenuItem } from "./MenuItem";
import { Privilege } from "./Privilege";
import { Translation } from "./Translation";

export interface Category {
    id: string;
    mediaUrl: string;
    parentCategoryId: string | null;
    subCategories: Category[];
    menuItems: MenuItem[];
    translations: Translation[];
    menuPriority: number;
}
