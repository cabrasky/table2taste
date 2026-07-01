import React from "react";
import "./style.css";
import { MenuItem } from "../../models/MenuItem";
import Translate from "../Translate";
import AllergenIcon from "../AllergenIcon/AllergenIcon";
import { useCart } from "../../contexts/CartContext";
import { IconButton, Tooltip } from "@mui/material";
import { AddShoppingCart, Restaurant } from "@mui/icons-material";

interface Props {
  menuItem: MenuItem;
  onAddToCart?: () => void;
}

const MenuItemListedElement: React.FC<Props> = ({ menuItem, onAddToCart }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id: menuItem.id!, quantity: 1, annotations: "" });
    if (onAddToCart) onAddToCart();
  };

  return (
    <div className="menu-item-card">
      <div className="menu-item-card-image-wrapper">
        <img
          className="menu-item-card-image"
          alt={menuItem.id!.toString()}
          src={menuItem.mediaUrl || ""}
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <div className="menu-item-card-image-fallback">
          <Restaurant className="fallback-icon" />
        </div>
        <div className="menu-item-card-overlay">
          <Tooltip title="Add to cart" arrow>
            <IconButton
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              size="large"
            >
              <AddShoppingCart />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <div className="menu-item-card-content">
        <div className="menu-item-card-title">
          <Translate translationKey={"name"} dataSet={menuItem.translations!} />
        </div>
        <div className="menu-item-card-ingredients">
          <Translate translationKey={"description"} dataSet={menuItem.translations!} />
        </div>
        <div className="menu-item-card-price">
          €{menuItem.price.toFixed(2)}
        </div>
        {menuItem.allergens && menuItem.allergens.length > 0 && (
          <div className="menu-item-card-allergens">
            {menuItem.allergens.map(allergen => (
              <AllergenIcon key={allergen.id} allergenId={allergen.id!} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemListedElement;
