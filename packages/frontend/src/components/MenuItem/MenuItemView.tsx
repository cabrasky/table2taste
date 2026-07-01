import React from "react";
import "./style.css";
import { MenuItem } from "../../models/MenuItem";
import Translate from "../Translate";
import AllergenIcon from "../AllergenIcon/AllergenIcon";
import { Icon } from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import { Protected } from "../Protected";
import { useCart } from "../../contexts/CartContext";
import { Link, Navigate } from "react-router-dom";
import { menuItemService } from "../../services/MenuItemService";

interface Props {
  menuItem: MenuItem
  admin?: boolean
}

const MenuItemView: React.FC<Props> = ({ menuItem, admin }) => {
  const { addToCart } = useCart();


  const deleteMenuItem = async (menuItemIdToDelete: string) => {
    try {
      await menuItemService.delete(menuItemIdToDelete);
      return <Navigate to={"/admin/"} />
    } catch (error) {
    }
  };
  return (
    <div className="menu-item-view">
      <div className="image">
      <img alt={menuItem.id} src={menuItem.mediaUrl} />
      </div>
      <div className="menu-item-description">
        <div className="name"><Translate translationKey="name" dataSet={menuItem.translations} /></div>
        <div className="allergens">
          <div className="allergen-text"><Translate translationKey="gui.allergens" /></div>
          {menuItem.allergens.map(allergen => (
            <AllergenIcon key={allergen.id} allergenId={allergen.id!} />
          ))}
        </div>
        <div className="description"><Translate translationKey="gui.description" /></div>
        <div className="description-text"><Translate translationKey="description" dataSet={menuItem.translations} /></div>
        <div className="actions">
          <Protected privilege="PLACE_ORDER">
            <button className="add-to-cart" onClick={() => {
              addToCart({
                id: menuItem.id!,
                quantity: 1,
                annotations: ""
              });
            }}>
              <div className="price">{menuItem.price}€</div>
              <div className="text-wrapper-2">Añadir al pedido</div>
              <Icon component={ShoppingCart} className="add-shopping-cart"/>
            </button>
          </Protected>
          {admin ?
            <>
              <Protected privilege="UPDATE_MENU_ITEMS">
                <Link to={`/admin/menuItem/${menuItem.id}/edit`}>Edit</Link>
              </Protected>
              <Protected privilege="DELETE_MENU_ITEMS">
                <button onClick={() => deleteMenuItem(menuItem.id!)}>Delete</button>
              </Protected>
            </>
            : <></>}
        </div>
      </div>
    </div >
  );
};

export default MenuItemView;