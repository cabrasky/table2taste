import React, { useState, useEffect, useRef } from 'react';
import { FormControlLabel, Checkbox, Tabs, Tab, TextField, InputAdornment, Drawer, IconButton, Button, Badge } from '@mui/material';
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
import { Search, FilterList, Close, RestaurantMenu } from '@mui/icons-material';

interface Props {
    admin?: boolean;
}

const MenuView: React.FC<Props> = ({ admin = false }) => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [allergens, setAllergens] = useState<Allergen[]>([]);
    const [rootCategories, setRootCategories] = useState<Category[]>([]);
    const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
    const [selectedCategoryTab, setSelectedCategoryTab] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const { id } = useParams<{ id: string }>();
    const { setBreadcrumbs } = useBreadcrumbs();
    const tabsRef = useRef<HTMLDivElement>(null);

    // Build category tabs: root categories + "All" option
    const categoryTabs = [
        { id: '', label: 'All', icon: <RestaurantMenu /> },
        ...rootCategories.map(cat => ({
            id: cat.id,
            label: cat.translations?.find(t => t.translationKey === 'name')?.value || cat.id,
            icon: null
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
        setSelectedAllergens(prevSelectedAllergens =>
            prevSelectedAllergens.includes(allergenId)
                ? prevSelectedAllergens.filter(id => id !== allergenId)
                : [...prevSelectedAllergens, allergenId]
        );
    };

    const handleCategoryTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedCategoryTab(newValue);
    };

    // Filter items by search query
    const filteredBySearch = menuItems.filter(item => {
        if (!searchQuery.trim()) return true;
        const name = item.translations?.find(t => t.translationKey === 'name')?.value || '';
        const desc = item.translations?.find(t => t.translationKey === 'description')?.value || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               desc.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Filter items by selected category tab
    const displayedItems = selectedCategoryTab === 0
        ? filteredBySearch
        : filteredBySearch.filter(item => item.categoryId === categoryTabs[selectedCategoryTab]?.id);

    return (
        <div className='menu-view'>
            {/* Hero Section */}
            <div className="menu-hero">
                <div className="menu-hero-content">
                    <h1 className="menu-hero-title">
                        <Translate translationKey={admin ? "gui.menu.admin" : "gui.menu"} />
                    </h1>
                    <p className="menu-hero-subtitle">
                        <Translate translationKey="gui.menu.subtitle" />
                    </p>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="menu-toolbar">
                <div className="menu-toolbar-inner">
                    <TextField
                        className="menu-search"
                        placeholder="Search menu..."
                        variant="outlined"
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search className="search-icon" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        className="filter-button"
                        variant="outlined"
                        startIcon={<FilterList />}
                        onClick={() => setFilterDrawerOpen(true)}
                    >
                        <Translate translationKey="gui.filters" />
                        {selectedAllergens.length > 0 && (
                            <Badge badgeContent={selectedAllergens.length} color="primary" className="filter-badge" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="category-tabs-container" ref={tabsRef}>
                <Tabs
                    value={selectedCategoryTab}
                    onChange={handleCategoryTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    className="category-tabs"
                    TabIndicatorProps={{
                        style: { backgroundColor: 'var(--main-color)', height: 3 }
                    }}
                >
                    {categoryTabs.map((cat, index) => (
                        <Tab
                            key={index}
                            label={
                                <div className="category-tab-label">
                                    {cat.icon && <span className="category-tab-icon">{cat.icon}</span>}
                                    <span>{cat.label}</span>
                                </div>
                            }
                            className="category-tab"
                        />
                    ))}
                </Tabs>
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
