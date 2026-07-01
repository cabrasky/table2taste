import React, { useEffect, useState, useCallback } from "react";
import Translate from "../../components/Translate";
import { useCart } from "../../contexts/CartContext";
import { Link } from "react-router-dom";
import { Protected } from "../../components/Protected";
import { useBreadcrumbs } from "../../contexts/BreadcrumbContext";
import TableSelector from "./TableSelector";
import './style.css'
import { ReceiptLong } from "@mui/icons-material";
import { Icon } from "@mui/material";

const CartPage: React.FC = () => {
    const { cart, menuItems, clearCart, updateCart, order, fetchMenuItems } = useCart();
    const [loading, setLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState<number | undefined>(1);
    const { setBreadcrumbs } = useBreadcrumbs();
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleQuantityChange = useCallback((index: number, quantity: number) => {
        updateCart(cart.map((cartItem, i) => i === index ? { ...cartItem, quantity } : cartItem));
    }, [cart, updateCart]);

    const handleAnnotationsChange = useCallback((index: number, annotations: string) => {
        updateCart(cart.map((cartItem, i) => i === index ? { ...cartItem, annotations } : cartItem));
    }, [cart, updateCart]);

    const removeFromCart = useCallback((index: number) => {
        updateCart(cart.filter((_, i) => i !== index));
    }, [cart, updateCart]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetching(true);
                await fetchMenuItems();
                setBreadcrumbs([]);
                setError(null);
            } catch (err) {
                setError("Failed to fetch data. Please try again later.");
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, [fetchMenuItems, setBreadcrumbs]);

    const handleOrder = async () => {
        setLoading(true);
        try {
            await order(selectedTable);
        } finally {
            setLoading(false);
        }
    };

    const handleTableSelect = (table: number) => {
        setSelectedTable(table);
    };

    if (fetching) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="cart-page">
            <h1>Your Cart</h1>
            <Protected privilege="PLACE_ORDER_TO_OTHERS">
                <TableSelector selectedTable={selectedTable} onTableSelect={handleTableSelect} />
            </Protected>
            {cart.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <>
                    <ul className="cart-items">
                        {cart.sort((itemA, itemB) => itemA.id.localeCompare(itemB.id)).map((item, index) => (
                            <li key={item.id} className="cart-item">
                                <div className="item-details">
                                    <span className="item-name">
                                        <Translate translationKey="name" dataSet={menuItems[item.id]?.translations} />
                                    </span>
                                    <span className="item-price">{menuItems[item.id]?.price.toFixed(2)}€</span>
                                </div>
                                <div className="item-controls">
                                    <label htmlFor={`quantity-${item.id}`}>Quantity:</label>
                                    <input
                                        id={`quantity-${item.id}`}
                                        type="number"
                                        defaultValue={item.quantity}
                                        min="1"
                                        onBlur={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                    />
                                    <div>
                                        <label htmlFor={`annotations-${item.id}`}>Annotations:</label>
                                        <textarea
                                            id={`annotations-${item.id}`}
                                            defaultValue={item.annotations}
                                            onBlur={(e) => handleAnnotationsChange(index, e.target.value)}
                                        />
                                    </div>
                                    <button onClick={() => removeFromCart(index)}>Remove</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="cart-actions">
                        <button onClick={() => clearCart()}>Clear Cart</button>
                        <button onClick={handleOrder} disabled={loading}>{loading ? 'Ordering...' : 'Order'}</button>
                    </div>
                </>
            )}

            <div className="cart-actions">
                <Link to="/view-receipt"><Translate translationKey="gui.seereceipt"/> <Icon component={ReceiptLong} /></Link>
            </div>
        </div>
    );
};

export default CartPage;