import { useParams, useSearchParams } from "react-router-dom";
import MenuItemForm from "../../../components/MenuItem/MenuItemForm";
import { useEffect, useState } from "react";
import { menuItemService } from "../../../services/MenuItemService";
import Translate from "../../../components/Translate";
import { useBreadcrumbs } from "../../../contexts/BreadcrumbContext";

export const MenuItemFormPage: React.FC = () => {
    const {id} = useParams();
    const [searchParams] = useSearchParams();
    const [categoryId, setCategoryId] = useState<string|undefined>();
    const { setBreadcrumbs } = useBreadcrumbs();

    

    useEffect(() => {
        const categoryIdParam = searchParams.get("categoryId") 
        setCategoryId(categoryIdParam || undefined)
        
        const fetchAncestors = async () => {
            const ancestors = await menuItemService.getAncestors(id!);
            return ancestors;
        };

        const fetchMenuItem = async () => {
            const item = await menuItemService.get(id!);
            return item;
        };

        const fetchData = async () => {
            const [ancestors, item] = await Promise.all([fetchAncestors(), fetchMenuItem()]);
            setBreadcrumbs([
                {
                    url: "/admin/",
                    label: <Translate translationKey="gui.menu.admin"/>
                },
                ...ancestors.reverse().map(categoryAncestor => ({
                    url: `/admin/category/${categoryAncestor.id}`,
                    label: <Translate translationKey="name" dataSet={categoryAncestor.translations} />
                })),
                {
                    url: `/admin/menuItem/${id}`,
                    label: <Translate translationKey="name" dataSet={item.translations} />
                }
            ]);
        };
        fetchData();

    }, [id, searchParams, setBreadcrumbs])

    return (
        <MenuItemForm menuItemId={id || undefined} defaultCategoryId={categoryId}/>
    )
}