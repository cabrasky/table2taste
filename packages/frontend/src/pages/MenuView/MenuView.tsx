import React, { useState, useEffect, useRef } from 'react';
import { FormControlLabel, Checkbox, Drawer, IconButton, Button, Badge } from '@mui/material';
import MenuItemListedElement from '../../components/MenuItem/MenuItemListedElement';
import { Allergen } from '../../models/Allergen';
import { MenuItem } from '../../models/MenuItem';
import { Category } from '../../models/Category';
import { allergenService } from '../../services/AllergenService';
import { menuItemService } from '../../services/MenuItemService';
import AllergenIcon from '../../components/AllergenIcon/AllergenIcon';
import { Link, useParams } from 'react-router-dom';
import { hideLoadingPopup, showErrorPopup, showLoadingPopup } from '../../utils/popupUtils';
import { categoryService } from '../../services/CategoryService';
import "./style.css";
import { useBreadcrumbs } from '../../contexts/BreadcrumbContext';
import Translate from '../../components/Translate';
import { Close, RestaurantMenu } from '@mui/icons-material';

interface Props {
    admin?: boolean;
}

const MenuView: React.FC<Props> = ({ admin = false }) => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [allergens, setAllergens] = useState<Allergen[]>([]);
    const [rootCategories, setRootCategories] = useState<Category[]>([]);
    const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(0);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const { id } = useParams<{ id: string }>();
    const { setBreadcrumbs } = useBreadcrumbs();
    const categoriesRef = useRef<HTMLDivElement>(null);

    // Build category pills: root categories + "All" option
    const categoryPills = [
        { id: '', label: 'All' },
        ...rootCategories.map(cat => ({
            id: cat.id,
            label: cat.translations?.find(t => t.translationKey === 'name')?.value || cat.id,
        }))
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                showLoadingPopup('Fetching data...');

                const [fetchedMenuItems, fetchedRootCategories, fetchedAllergens] = await Promise.all([
                    menuItemService.getAllByAllergens(id || "", selectedAllergens),
                    categoryService.getAll({ parentCategoryId: "" }),
                    allergenService.getAll()
                ]);

                setMenuItems(fetchedMenuItems);
                setRootCategories(fetchedRootCategories);
                setAllergens(fetchedAllergens);

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
    }, [admin, id, setBreadcrumbs]);

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
        setSelectedAllergens(prev =>
            prev.includes(allergenId)
                ? prev.filter(id => id !== allergenId)
                : [...prev, allergenId]
        );
    };

    const handleCategoryClick = (index: number) => {
        setSelectedCategoryIndex(index);
    };

    // Filter items by selected category
    const displayedItems = selectedCategoryIndex === 0
        ? menuItems
        : menuItems.filter(item => item.categoryId === categoryPills[selectedCategoryIndex]?.id);

    return (
        <div className='menu-view'>
            {/* Allergen Selector — prominent pill button at top, like gosushing */}
            <div className="menu-top-bar">
                <Button
                    className="allergen-selector-btn"
                    startIcon={<img src="/allergen-icon.svg" alt="allergens" className="allergen-icon" onError={(e)=>{const t=e.target as HTMLImageElement;t.style.display="none"}} />}
                    onClick={() => setFilterDrawerOpen(true)}
                >
                    Select Allergens
                    {selectedAllergens.length > 0 && (
                        <Badge badgeContent={selectedAllergens.length} color="primary" className="allergen-badge" />
                    )}
                </Button>
            </div>

            {/* Category Pills — horizontal scroll, like gosushing */}
            <div className="category-pills-container" ref={categoriesRef}>
                {categoryPills.map((cat, index) => (
                    <button
                        key={index}
                        className={`category-pill ${index === selectedCategoryIndex ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(index)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Menu Items Grid */}
            <div className="menu-content">
                {displayedItems.length === 0 ? (
                    <div className="menu-empty">
                        <RestaurantMenu className="menu-empty-icon" />
                        <p><Translate translationKey="gui.menu.empty" /></p>
                    </div>
                ) : (
                    <div className="menu-items-grid">
                        {displayedItems.map((menuItem) => (
                            <Link
                                key={menuItem.id}
                                to={`${admin ? "/admin" : ""}/menuItem/${menuItem.id}${admin ? "/edit" : ""}`}
                                className="menu-item-link"
                            >
                                <MenuItemListedElement menuItem={menuItem} />
                            </Link>
                        ))}
                    </div>
                )}
                {admin && (
                    <div className="menu-admin-add">
                        <Link to={`/admin/menuItem/add?categoryId=${id}`} className="admin-add-btn">
                            + Add Menu Item
                        </Link>
                    </div>
                )}
            </div>

            {/* Allergen Filter Drawer */}
            <Drawer
                anchor="right"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                PaperProps={{
                    className: "allergen-drawer"
                }}
            >
                <div className="allergen-drawer-header">
                    <h3><Translate translationKey="gui.allergen.filter" /></h3>
                    <IconButton onClick={() => setFilterDrawerOpen(false)}>
                        <Close />
                    </IconButton>
                </div>
                <div className="allergen-drawer-content">
                    <form className="allergen-filter-form">
                        {allergens.map((allergen) => (
                            <FormControlLabel
                                key={allergen.id}
                                control={
                                    <Checkbox
                                        checked={selectedAllergens.includes(allergen.id)}
                                        onChange={() => handleAllergenChange(allergen.id)}
                                        sx={{
                                            color: 'var(--grey-40)',
                                            '&.Mui-checked': {
                                                color: 'var(--main-color)',
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <div className="allergen-filter-item">
                                        <AllergenIcon key={allergen.id} allergenId={allergen.id!} />
                                        <span><Translate translationKey='name' dataSet={allergen.translations} /></span>
                                    </div>
                                }
                            />
                        ))}
                    </form>
                    {selectedAllergens.length > 0 && (
                        <Button
                            className="clear-filters-btn"
                            onClick={() => setSelectedAllergens([])}
                            variant="text"
                            color="primary"
                        >
                            <Translate translationKey="gui.clear.filters" />
                        </Button>
                    )}
                </div>
            </Drawer>
        </div>
    );
};

export default MenuView;
