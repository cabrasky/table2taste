import React, { useState } from 'react';
import { Category } from '../../models/Category';
import Translate from '../Translate';
import { Link } from 'react-router-dom';
import './style.css'

interface TreeMenuNodeProps {
    category: Category,
    level?: number,
    admin?: boolean;
    selectedCategoryId: string;
}

interface TreeMenuProps {
    categories: Category[],
    admin?: boolean;
    selectedCategoryId?: string;
}

const TreeMenuNode: React.FC<TreeMenuNodeProps> = ({ category, level = 0, admin = false, selectedCategoryId }) => {
    const [expanded, setExpanded] = useState<boolean>(true);

    const handleToggle = () => {
        setExpanded(!expanded);
    };

    return (
        <div className={`tree-menu-node ${selectedCategoryId === category.id ? "actual" : ""}`}>
            <div>
                {(category.subCategories.length > 0 || admin) && (
                    <button onClick={handleToggle}>
                        {(category.subCategories.length > 0 || admin) && (expanded ? '-' : '+')}
                    </button>
                )}
                <Link to={`${admin ? "/admin" : ""}/category/${category.id}`}>
                    <Translate translationKey='name' dataSet={category.translations} />
                </Link>
                {expanded && (category.subCategories.length > 0 || admin) && (
                    <div className='tree-menu-children' style={{ marginLeft: level+1 * 20 }}>
                        {category.subCategories.map((category) => (
                            <TreeMenuNode key={category.id} category={category} level={level + 1} admin={admin} selectedCategoryId={selectedCategoryId} />
                        ))}
                        {admin && (
                            <Link to={`/admin/category/add?parentCategoryId=${category.id}`}>Add</Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const TreeMenu: React.FC<TreeMenuProps> = ({ categories, admin = false, selectedCategoryId = "" }) => {
    return (
        <div className='tree-menu'>
            {categories.map((category) => (
                <TreeMenuNode key={category.id} category={category} admin={admin} selectedCategoryId={selectedCategoryId} />
            ))}
            {admin && (
                <Link to="/admin/category/add">Add</Link>
            )}
        </div>
    );
}

export default TreeMenu;