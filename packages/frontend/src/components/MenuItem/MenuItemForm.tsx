import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { MenuItem } from '../../models/MenuItem';
import { Category } from '../../models/Category';
import Translate from '../Translate';
import { menuItemService } from '../../services/MenuItemService';
import { categoryService } from '../../services/CategoryService';
import { languageService } from '../../services/LanguageService';
import { Language } from '../../models/Language';
import { useNavigate } from 'react-router-dom';
import { Allergen } from '../../models/Allergen';
import { allergenService } from '../../services/AllergenService';
import { imageService } from '../../services/ImageService';
import { showErrorPopup, showLoadingPopup, showSuccessPopup } from '../../utils/popupUtils';

interface UserFormProps {
    menuItemId?: string;
    defaultCategoryId?: string;
}

interface MenuItemTranslation {
    name?: string;
    description?: string;
}

interface MenuItemTranslationGroup {
    [key: string]: MenuItemTranslation
}

const MenuItemForm: React.FC<UserFormProps> = ({ menuItemId, defaultCategoryId = "" }) => {
    const navigate = useNavigate();

    const [id, setId] = useState<string>("");
    const [categoryId, setCategoryId] = useState<string>("");
    const [mediaUrl, setMediaUrl] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [menuPriority, setMenuPriority] = useState<number>(0);
    const [translations, setTranslations] = useState<MenuItemTranslationGroup>({});
    const [languages, setLanguages] = useState<Language[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [allergens, setAllergens] = useState<Allergen[]>([])
    const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
    const languageSelector = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        setCategoryId(defaultCategoryId);
        const fetchCategories = async () => {
            try {
                const categories = await categoryService.getAll();
                setCategories(categories);
            } catch (error) {
                showErrorPopup("Error loading Categories");
            }
        };

        const fetchLanguages = async () => {
            try {
                const languages = await languageService.getAll();
                setLanguages(languages);
            } catch (error) {
                showErrorPopup("Error Loading");
            }
        };

        const fetchAllergens = async () => {
            try {
                const allergens = await allergenService.getAll();
                setAllergens(allergens);
            } catch (error) {
                showErrorPopup("Error Loading");
            }
        };

        const fetchMenuItem = async (id: string) => {
            setId(id)
            try {
                const menuItem = await menuItemService.get(id);
                setMediaUrl(menuItem.mediaUrl);
                setCategoryId(menuItem.categoryId || "");
                setPrice(menuItem.price);
                setSelectedAllergens(menuItem.allergens.map(allergen => allergen.id!))
                const translationsObject: MenuItemTranslationGroup = {};
                menuItem.translations.forEach(translation => {
                    if (translation.language && translation.language.id) {
                        const languageId = translation.language.id;
                        const translationKey = translation.translationKey as keyof MenuItemTranslation;
                        translationsObject[languageId] = translationsObject[languageId] || {};
                        translationsObject[languageId][translationKey] = translation.value;
                    }
                });
                setTranslations(translationsObject);
            } catch (error) {
                showErrorPopup('Error loading the item');
                navigate('/admin/');
            }
        };

        async function fetchData() {
            showLoadingPopup("Loading");
            await Promise.all([fetchCategories(), fetchLanguages(), fetchAllergens()]);
            if (menuItemId) {
                await fetchMenuItem(menuItemId);
            }
        }
        fetchData();
    }, [menuItemId, defaultCategoryId, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let uploadedMediaUrl = mediaUrl;

            if (file) {
                const response = await imageService.uploadImage(file);
                uploadedMediaUrl = response.url;
            }

            const menuItem: MenuItem = {
                categoryId,
                mediaUrl: uploadedMediaUrl,
                price,
                translations: Object.entries(translations).flatMap(([languageId, translation]) => (
                    [
                        { language: { id: languageId }, translationKey: "name", value: translation.name },
                        { language: { id: languageId }, translationKey: "description", value: translation.description }
                    ]
                )),
                menuPriority,
                id: id,
                allergens: selectedAllergens.map(selectedAllergen => ({
                    id: selectedAllergen
                }))
            };

            if (menuItemId) {
                await menuItemService.update(menuItemId, menuItem);
            } else {
                await menuItemService.create(menuItem);
            }
            showSuccessPopup("Menu Item added");
            navigate("/admin/");
        } catch (error) {
            showErrorPopup(`Error: ${error}`);
        }
    };

    const handleTranslationChange = (languageId: string, field: keyof MenuItemTranslationGroup, value: string) => {
        setTranslations(prevTranslations => ({
            ...prevTranslations,
            [languageId]: {
                ...prevTranslations[languageId],
                [field]: value
            }
        }));
    };

    const handleAddTranslation = () => {
        if (languageSelector.current && languageSelector.current.value) {
            const newLanguageId = languageSelector.current.value;
            setTranslations(prevTranslations => ({
                ...prevTranslations,
                [newLanguageId]: {}
            }));
        }
    };

    const handleRemoveTranslation = (languageId: string) => {
        setTranslations(prevTranslations => {
            const newTranslations = { ...prevTranslations };
            delete newTranslations[languageId];
            return newTranslations;
        });
    };

    const handleAllergenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setSelectedAllergens(selectedOptions);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && e.target.result) {
                    setMediaUrl(e.target.result as string);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleResetMedia = () => {
        setFile(null);
        setMediaUrl('');
    };

    const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        setMediaUrl(e.target.value);
    };

    const handleDelete = async () => {
        if (!menuItemId) return;

        try {
            await menuItemService.delete(menuItemId);
            showSuccessPopup('Menu Item deleted successfully');
            navigate("/admin");
        } catch (error) {
            showErrorPopup('Error deleting the category');
        }
    };

    return (
        <div className='form'>
            <h2>{menuItemId ? 'Modify Menu Item' : 'Create Menu Item'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Id:</label>
                    <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
                </div>
                <div>
                    <label>Price:</label>
                    <input type="number" step="0.01" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} />
                </div>
                <div>
                    <label>Menu Priority:</label>
                    <input type="number" step={1} value={menuPriority} onChange={(e) => setMenuPriority(parseInt(e.target.value))} />
                </div>
                <div>
                    <label>Category:</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                        <option value="" disabled>
                            <Translate translationKey={'gui.category.select'} />
                        </option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id!}>
                                <Translate translationKey={'name'} dataSet={category.translations} />
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <fieldset>
                        <legend>Allergens:</legend>
                        <select multiple value={selectedAllergens} onChange={handleAllergenChange}>
                            {allergens.map(allergen => (
                                <option value={allergen.id} key={allergen.id}><Translate translationKey='name' dataSet={allergen.translations} /></option>
                            ))}
                        </select>
                    </fieldset>
                </div>
                <div>
                    <label>Media:</label>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        <button type="button" onClick={() => setShowUrlInput(!showUrlInput)}>
                            {showUrlInput ? 'Upload Image' : 'Insert Link'}
                        </button>
                        {showUrlInput && (
                            <input
                                type="text"
                                value={mediaUrl}
                                onChange={handleUrlChange}
                                placeholder="Insert image URL"
                                style={{ display: 'block', width: '100%', marginTop: '10px' }}
                            />
                        )}
                        {mediaUrl && (
                            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                <img src={mediaUrl} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
                                <button type="button" onClick={handleResetMedia} style={{ marginTop: '10px' }}>
                                    Reset
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <fieldset>
                        <legend>Translations:</legend>
                        <div className='translations'>
                            {Object.entries(translations).map(([languageId, translation], key) => (
                                <legend key={key}>
                                    <legend>Language: {languageId}</legend>
                                    <label>Name:</label>
                                    <input type="text" value={translation.name || ""} onChange={(e) => handleTranslationChange(languageId, 'name', e.target.value)} />
                                    <label>Description:</label>
                                    <textarea value={translation.description || ""} onChange={(e) => handleTranslationChange(languageId, 'description', e.target.value)} />
                                    <button type="button" onClick={() => handleRemoveTranslation(languageId)}>Remove</button>
                                </legend>
                            ))}
                        </div>
                        <select name="languages" ref={languageSelector}>
                            {languages.filter(lang => !Object.keys(translations).includes(lang.id)).map((lang, key) => (
                                <option key={key} value={lang.id}>{lang.id}</option>
                            ))}
                        </select>
                        <button type="button" onClick={handleAddTranslation}>Add</button> {/* Specify button type */}
                    </fieldset>
                </div>
                <button type="submit">{menuItemId ? 'Modify' : 'Create'}</button>

                {menuItemId && (
                    <button type="button" onClick={handleDelete} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>
                        Delete
                    </button>
                )}
            </form>
        </div>
    );
};

export default MenuItemForm;
