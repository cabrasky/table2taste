import React from 'react';
import './style.css'

interface Props {
    allergenId: string;
}

const MenuItemForm: React.FC<Props> = ({ allergenId }) => {
    return (
        <img className='allergen-icon' alt={`${allergenId} allergen icon`}src={`/img/allergens/${allergenId}.png`} />
    );
};

export default MenuItemForm;
