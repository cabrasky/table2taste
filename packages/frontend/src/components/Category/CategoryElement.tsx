import React from "react";
import Translate from "../Translate";
import { Category } from "../../models/Category";

interface Props {
  category: Category,
  children?: React.ReactNode
}

const MenuItemElement: React.FC<Props> = ({ category, children }) => {
  return (
    <div className="category">
      <img className="image" alt="Image" src={category.mediaUrl} />
      <div className="frame">
        <div className={"title"}><Translate translationKey={"name"} dataSet={category.translations!} /> </div>
      </div>
      {children}
    </div>
  );
};

export default MenuItemElement;

