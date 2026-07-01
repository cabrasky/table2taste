import "./style.css";
import LanguageSelector from "../LanguageSelector/LanguageSelector";
import Breadcrumb from "../Breadcrumb";
import { useCart } from "../../contexts/CartContext";
import { Link } from "react-router-dom";
import { Icon, Badge } from "@mui/material";
import { ShoppingCart, Restaurant, AdminPanelSettings, TableRestaurant } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { Protected } from "../Protected";
import Translate from "../Translate";

export const TopMenu: React.FC = () => {
    const { cart } = useCart();
    const { user, setToken } = useAuth()
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="top-menu">
            <div className="top-menu-inner">
                <div className="restaurant-brand">
                    <Link to={"/"} className="brand-link">
                        <Restaurant className="brand-icon" />
                        <span className="brand-name">Table2Taste</span>
                    </Link>
                </div>
                <div className="top-menu-nav">
                    <div className="breadcrumb-wrapper">
                        <Breadcrumb />
                    </div>
                    <div className="top-menu-actions">
                        <div className="language-selector">
                            <LanguageSelector />
                        </div>
                        <Protected privilege="PLACE_ORDER">
                            <div className="cart">
                                <Link to='/cart' className="cart-link">
                                    <Badge badgeContent={totalItems} color="primary" overlap="circular">
                                        <ShoppingCart className="cart-icon" />
                                    </Badge>
                                </Link>
                            </div>
                        </Protected>
                        <Protected privilege="ADMIN_VIEW">
                            <div className="admin-link">
                                <Link to='/admin/'>
                                    <AdminPanelSettings className="action-icon" />
                                </Link>
                            </div>
                        </Protected>
                        <Protected privilege="VIEW_TABLES">
                            <div className="table-view-link">
                                <Link to='/tableview'>
                                    <TableRestaurant className="action-icon" />
                                </Link>
                            </div>
                        </Protected>
                        <div className="user-menu">
                            {user !== null ? (
                                <div className="user-info" onClick={() => setToken(null)}>
                                    <span className="user-name">{user.name}</span>
                                </div>
                            ) : (
                                <Link to='/login' className="login-link">
                                    <Translate translationKey="gui.login" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
