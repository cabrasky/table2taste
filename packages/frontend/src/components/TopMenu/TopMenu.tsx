import "./style.css";
import LanguageSelector from "../LanguageSelector/LanguageSelector";
import Breadcrumb from "../Breadcrumb";
import { useCart } from "../../contexts/CartContext";
import { Link } from "react-router-dom";
import { Icon } from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { Protected } from "../Protected";
import Translate from "../Translate";

export const TopMenu: React.FC = () => {
    const { cart } = useCart();
    const { user, setToken } = useAuth()
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="top-menu">
            <div className="restaurant-name">
                <Link to={"/"}>Table2Taste</Link>
            </div>
            <div className="nav">
                <Breadcrumb />
                <div className="language-selector">
                    <LanguageSelector />
                </div>
                <div className="user">
                    {user !== null ? (
                        <p onClick={() => setToken(null)}><Translate translationKey="gui.profile" /> {user.name}</p>
                    ) : (
                        <Link to='/login'>
                            Login
                        </Link>
                    )}
                </div>
                <Protected privilege="ADMIN_VIEW">
                    <div className="admin-page">
                        <Link to='/admin/'>
                            <Translate translationKey="gui.adminpage"/>
                        </Link>
                    </div>
                </Protected>
                <Protected privilege="PLACE_ORDER">
                    <div className="cart">
                        <Link to='/cart'>
                            <Icon component={ShoppingCart} />{totalItems}
                        </Link>
                    </div>
                </Protected>
                <Protected privilege="VIEW_TABLES">
                    <div className="table-view-link">
                        <Link to='/tableview'>
                            TableView
                        </Link>
                    </div>
                </Protected>
            </div>
        </header >
    );
};
