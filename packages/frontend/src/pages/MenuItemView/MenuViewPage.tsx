import { useEffect, useState } from "react";
import Translate from "../../components/Translate";
import { useBreadcrumbs } from "../../contexts/BreadcrumbContext";
import { useParams } from "react-router-dom";
import "./style.css";
import MenuItemView from "../../components/MenuItem/MenuItemView";
import { menuItemService } from "../../services/MenuItemService";
import { MenuItem } from "../../models/MenuItem";

interface Props {
    admin?: boolean;
}

export const MenuItemPage: React.FC<Props> = ({ admin = false }) => {
    const { setBreadcrumbs } = useBreadcrumbs();
    const [menuItem, setMenuItem] = useState<MenuItem>();
    const { id } = useParams();

    useEffect(() => {
        const fetchAncestors = async () => {
            const ancestors = await menuItemService.getAncestors(id!);
            return ancestors;
        };

        const fetchMenuItem = async () => {
            const item = await menuItemService.get(id!);
            setMenuItem(item);
            return item;
        };

        const fetchData = async () => {
            const [ancestors, item] = await Promise.all([fetchAncestors(), fetchMenuItem()]);
            setBreadcrumbs([
                {
                    url: admin ? "/admin/" : "/",
                    label: <Translate translationKey={admin ? "gui.menu.admin" : "gui.menu"} />
                },
                ...ancestors.reverse().map(categoryAncestor => ({
                    url: `${admin  ? "/admin" : ""}/category/${categoryAncestor.id}`,
                    label: <Translate translationKey="name" dataSet={categoryAncestor.translations} />
                })),
                {
                    url: `${admin  ? "/admin" : ""}/menuItem/${id}`,
                    label: <Translate translationKey="name" dataSet={item.translations} />
                }
            ]);
        };

        fetchData();
    }, [id, admin, setBreadcrumbs]);

    return (
        <div>
            {menuItem ?
                <MenuItemView menuItem={menuItem} admin={admin}/>
                : <p>Loading...</p>}
        </div>
    );
};
