import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Category } from '../../models/Category';
import { categoryService } from '../../services/CategoryService';
import { useNavigate } from 'react-router-dom';
import Translate from '../Translate';
import { Language } from '../../models/Language';
import { languageService } from '../../services/LanguageService';
import { hideLoadingPopup, showErrorPopup, showLoadingPopup, showSuccessPopup } from '../../utils/popupUtils';
import { imageService } from '../../services/ImageService';

interface CategoryFormProps {
    categoryId?: string;
    defaultParentCategoryId?: string;
}

interface CategoryTranslation {
    name: string;
}

interface CategoryTranslationGroup {
    [key: string]: CategoryTranslation
}

const CategoryForm: React.FC<CategoryFormProps> = ({ categoryId, defaultParentCategoryId = "" }) => {
    const navigate = useNavigate();

    const [id, setId] = useState<string>("")
    const [mediaUrl, setMediaUrl] = useState<string>('');
    const [parentCategoryId, setParentCategoryId] = useState<string>("");
    const [menuPriority, setMenuPriority] = useState<number>(0);
    const [translations, setTranslations] = useState<CategoryTranslationGroup>({});
    const [languages, setLanguages] = useState<Language[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
    const languageSelector = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        setParentCategoryId(defaultParentCategoryId);
        const fetchCategories = async () => {
            try {
                const allCategories = await categoryService.getAll();
                setCategories(allCategories);
            } catch (error) {
                hideLoadingPopup();
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

        const fetchCategory = async (id: string) => {
            setId(id);
            try {
                const category = await categoryService.get(id);
                setMediaUrl(category.mediaUrl);
                setParentCategoryId(category.parentCategoryId || defaultParentCategoryId);
                const translationsObject: CategoryTranslationGroup = {};
                category.translations.forEach(translation => {
                    if (translation.language && translation.language.id) {
                        const languageId = translation.language.id;
                        const translationKey = translation.translationKey as keyof CategoryTranslation;
                        translationsObject[languageId] = translationsObject[languageId] || {};
                        translationsObject[languageId][translationKey] = translation.value;
                    }
                });
                setTranslations(translationsObject);
            } catch (error) {
                showErrorPopup('Error loading the category');
                navigate(new URL('..', window.location.href).pathname);
            }
        };

        async function fetchData() {
            showLoadingPopup("Loading");
            Promise.all([fetchCategories(), fetchLanguages()]).finally(() => {
                hideLoadingPopup();
            });
        }
        fetchData();
        if (categoryId) {
            fetchCategory(categoryId);
        }
    }, [categoryId, defaultParentCategoryId, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let uploadedMediaUrl = mediaUrl;

            if (file) {
                const response = await imageService.uploadImage(file);
                uploadedMediaUrl = response.url;
            }
            const category: Category = {
                mediaUrl: uploadedMediaUrl,
                parentCategoryId: parentCategoryId,
                translations: Object.entries(translations).map(([languageId, translation]) => (
                    {
                        language: {
                            id: languageId
                        },
                        translationKey: "name",
                        value: translation.name
                    }
                )),
                menuItems: [],
                subCategories: [],
                menuPriority,
                id: id
            };

            if (categoryId) {
                await categoryService.update(categoryId, category);
            } else {
                await categoryService.create(category);
            }
            showSuccessPopup('Category saved successfully');
            navigate(new URL(categoryId ? '..' : './', window.location.href).pathname);
        } catch (error) {
            showErrorPopup('Error saving the category');
        }
    };

    const handleDelete = async () => {
        if (!categoryId) return;

        try {
            await categoryService.delete(categoryId);
            showSuccessPopup('Category deleted successfully');
            navigate("/admin");
        } catch (error) {
            showErrorPopup('Error deleting the category');
        }
    };

    const handleTranslationChange = (languageId: string, field: keyof CategoryTranslation, value: string) => {
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
                [newLanguageId]: {
                    name: ""
                }
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

    return (
        <div className='form'>
            <h2>{categoryId ? 'Modify Category' : 'Create Category'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Id:</label>
                    <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
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
                    <label>Menu Priority:</label>
                    <input type="number" step={1} value={menuPriority} onChange={(e) => setMenuPriority(parseInt(e.target.value))} />
                </div>
                <div>
                    <label>Parent Category:</label>
                    <select value={parentCategoryId} onChange={(e) => setParentCategoryId(e.target.value)}>
                        <option value=""><Translate translationKey={'gui.category.select'} /></option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id!}><Translate translationKey='name' dataSet={category.translations} /></option>
                        ))}
                    </select>
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
                                    <button type="button" onClick={() => handleRemoveTranslation(languageId)}>Remove</button>
                                </legend>
                            ))}
                        </div>
                        <select name="languages" ref={languageSelector}>
                            {languages.filter(lang => !Object.keys(translations).includes(lang.id)).map((lang, key) => (
                                <option key={key} value={lang.id}>{lang.id}</option>
                            ))}
                        </select>
                        <button type="button" onClick={handleAddTranslation}>Add</button>
                    </fieldset>
                </div>
                <button type="submit">{categoryId ? 'Modify' : 'Create'}</button>
                {categoryId && (
                    <button type="button" onClick={handleDelete} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>
                        Delete
                    </button>
                )}
            </form>
        </div>
    );
};

export default CategoryForm;
