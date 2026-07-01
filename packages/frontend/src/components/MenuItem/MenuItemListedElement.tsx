import React from "react";
import "./style.css";
import { MenuItem } from "../../models/MenuItem";
import Translate from "../Translate";
import AllergenIcon from "../AllergenIcon/AllergenIcon";

interface Props {
  menuItem: MenuItem
}

const MenuItemListedElement: React.FC<Props> = ({ menuItem }) => {
  return (
    <div className="menu-item-listed">
      <img className="image" alt={menuItem.id!.toString()} src={menuItem.mediaUrl} />
      <div className="frame">
        <div className={"title"}><Translate translationKey={"name"} dataSet={menuItem.translations!} /> </div>
        <div className={"price"}>{menuItem.price}€</div>
        <div className={"allergens"}>
          {menuItem.allergens.map(allergen => (
            <AllergenIcon key={allergen.id} allergenId={allergen.id!} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuItemListedElement;

