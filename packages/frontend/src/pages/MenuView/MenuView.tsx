import React, { useState, useEffect } from 'react';
import { FormControlLabel, Checkbox } from '@mui/material';
import MenuItemListedElement from '../../components/MenuItem/MenuItemListedElement';
import { Allergen } from '../../models/Allergen';
import { MenuItem } from '../../models/MenuItem';
import { allergenService } from '../../services/AllergenService';
import { menuItemService } from '../../services/MenuItemService';
import AllergenIcon from '../../components/AllergenIcon/AllergenIcon';
import { Link, useParams } from 'react-router-dom';
import { hideLoadingPopup, showErrorPopup, showLoadingPopup } from '../../utils/popupUtils';
import TreeMenu from '../../components/TreeMenu/TreeMenu';
import { categoryService } from '../../services/CategoryService';
import { Category } from '../../models/Category';
import "./style.css";
import { useBreadcrumbs } from '../../contexts/BreadcrumbContext';
import Translate from '../../components/Translate';
import FilterListIcon from '@mui/icons-material/FilterList';

interface Props {
    admin?: boolean;
}

const MenuView: React.FC<Props> = ({ admin = false }) => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [allergens, setAllergens] = useState<Allergen[]>([]);
    const [rootCategories, setRootCategories] = useState<Category[]>([]);
    const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { id } = useParams<{ id: string }>();
    const { setBreadcrumbs } = useBreadcrumbs();

    useEffect(() => {
        const fetchData = async () => {
            try {
                showLoadingPopup('Fetching data...');

                const [menuItems, rootCategories, allergens] = await Promise.all([
                    menuItemService.getAllByAllergens(id || "", selectedAllergens),
                    categoryService.getAll({ parentCategoryId: "" }),
                    allergenService.getAll()
                ]);

                setMenuItems(menuItems);
                setRootCategories(rootCategories);
                setAllergens(allergens);

                const ancestors = await menuItemService.getAncestors(id!);
                setBreadcrumbs([
                    {
                        url: admin ? "/admin/" : "/",
                        label: <Translate translationKey={admin ? "gui.menu.admin" : "gui.menu"} />
                    },
                    ...ancestors.reverse().map(categoryAncestor => ({
                        url: `${admin ? "/admin" : ""}/category/${categoryAncestor.id}`,
                        label: <Translate translationKey="name" dataSet={categoryAncestor.translations} />
                    }))
                ]);

                hideLoadingPopup();
            } catch (error) {
                console.error('Error fetching data:', error);
                showErrorPopup('Failed to fetch data. Please try again later.');
                hideLoadingPopup();
            }
        };

        fetchData();
    }, [admin, id, setBreadcrumbs, selectedAllergens]);

    useEffect(() => {
        const fetchFilteredMenuItems = async () => {
            try {
                const filteredMenuItems = await menuItemService.getAllByAllergens(id || "", selectedAllergens);
                setMenuItems(filteredMenuItems);
            } catch (error) {
                console.error('Error fetching filtered menu items:', error);
                showErrorPopup('Failed to fetch filtered menu items. Please try again later.');
            }
        };

        fetchFilteredMenuItems();
    }, [selectedAllergens, id]);

    const handleAllergenChange = (allergenId: string) => {
        setSelectedAllergens(prevSelectedAllergens =>
            prevSelectedAllergens.includes(allergenId)
                ? prevSelectedAllergens.filter(id => id !== allergenId)
                : [...prevSelectedAllergens, allergenId]
        );
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className='menu-view'>
            <TreeMenu categories={rootCategories} admin={admin} selectedCategoryId={id} />
            <div className="content">
                <div className="menu-item-list">
                    {menuItems.map((menuItem) => (
                        <Link key={menuItem.id} to={`${admin ? "/admin" : ""}/menuItem/${menuItem.id}${admin ? "/edit" : ""}`}>
                            <MenuItemListedElement menuItem={menuItem} />
                        </Link>
                    ))}
                    {admin && <Link to={`/admin/menuItem/add?categoryId=${id}`}>Add Menu Item</Link>}
                </div>
                <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                    <button onClick={toggleSidebar} className="toggle-sidebar-button">
                        <FilterListIcon />
                    </button>
                    <form className="allergen-filter-form">
                        {allergens.map((allergen) => (
                            <FormControlLabel
                                key={allergen.id}
                                control={
                                    <Checkbox
                                        checked={selectedAllergens.includes(allergen.id)}
                                        onChange={() => handleAllergenChange(allergen.id)}
                                    />
                                }
                                label={
                                    <div>
                                        <AllergenIcon key={allergen.id} allergenId={allergen.id!} />
                                        <Translate translationKey='name' dataSet={allergen.translations} />
                                    </div>
                                }
                            />
                        ))}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MenuView;
