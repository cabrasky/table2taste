import React, { useEffect, useState, useCallback } from "react";
import Translate from "../../components/Translate";
import { useCart } from "../../contexts/CartContext";
import { Link } from "react-router-dom";
import { Protected } from "../../components/Protected";
import { useBreadcrumbs } from "../../contexts/BreadcrumbContext";
import TableSelector from "./TableSelector";
import './style.css'
import { ReceiptLong, Delete, Add, Remove, ShoppingCart, ArrowBack } from "@mui/icons-material";
import { Button, IconButton, Divider, CircularProgress } from "@mui/material";

const CartPage: React.FC = () => {
    const { cart, menuItems, clearCart, updateCart, order, fetchMenuItems } = useCart();
    const [loading, setLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState<number | undefined>(1);
    const { setBreadcrumbs } = useBreadcrumbs();
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleQuantityChange = useCallback((index: number, quantity: number) => {
        if (quantity < 1) return;
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

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => {
        const menuItem = menuItems[item.id];
        return sum + (menuItem?.price || 0) * item.quantity;
    }, 0);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (fetching) {
        return (
            <div className="cart-page-loading">
                <CircularProgress sx={{ color: 'var(--main-color)' }} />
                <p>Loading your cart...</p>
            </div>
        );
    }

    if (error) {
        return <div className="cart-page-error"><p>{error}</p></div>;
    }

    return (
        <div className="cart-page">
            <div className="cart-page-header">
                <div className="cart-page-header-content">
                    <h1 className="cart-page-title">
                        <ShoppingCart sx={{ fontSize: 32 }} />
                        <Translate translationKey="gui.cart" />
                    </h1>
                    <p className="cart-page-subtitle">
                        {totalItems > 0
                            ? `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`
                            : 'Your cart is empty'}
                    </p>
                </div>
                <Protected privilege="PLACE_ORDER_TO_OTHERS">
                    <TableSelector selectedTable={selectedTable} onTableSelect={handleTableSelect} />
                </Protected>
            </div>

            <div className="cart-page-layout">
                {cart.length === 0 ? (
                    <div className="cart-empty">
                        <ShoppingCart className="cart-empty-icon" />
                        <h2><Translate translationKey="gui.cart.empty" /></h2>
                        <p>Browse our delicious menu and add items you'd like to order.</p>
                        <Link to="/" className="browse-menu-btn">
                            <ArrowBack /> Browse Menu
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="cart-items-section">
                            <div className="cart-items-list">
                                {cart
                                    .sort((itemA, itemB) => itemA.id.localeCompare(itemB.id))
                                    .map((item, index) => {
                                        const menuItem = menuItems[item.id];
                                        return (
                                            <div key={`${item.id}-${index}`} className="cart-item-card">
                                                <div className="cart-item-image">
                                                    <img
                                                        src={menuItem?.mediaUrl || ''}
                                                        alt={menuItem?.id}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                        }}
                                                    />
                                                    {!menuItem?.mediaUrl && (
                                                        <div className="cart-item-image-fallback">
                                                            <ShoppingCart className="fallback-icon" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="cart-item-info">
                                                    <div className="cart-item-header">
                                                        <h4 className="cart-item-name">
                                                            <Translate translationKey="name" dataSet={menuItem?.translations} />
                                                        </h4>
                                                        <span className="cart-item-unit-price">
                                                            €{menuItem?.price.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="cart-item-annotations">
                                                        <input
                                                            className="cart-annotation-input"
                                                            type="text"
                                                            placeholder="Special instructions..."
                                                            defaultValue={item.annotations}
                                                            onBlur={(e) => handleAnnotationsChange(index, e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="cart-item-controls">
                                                        <div className="quantity-controls">
                                                            <IconButton
                                                                size="small"
                                                                className="qty-btn"
                                                                onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Remove fontSize="small" />
                                                            </IconButton>
                                                            <span className="quantity-value">{item.quantity}</span>
                                                            <IconButton
                                                                size="small"
                                                                className="qty-btn"
                                                                onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                                            >
                                                                <Add fontSize="small" />
                                                            </IconButton>
                                                        </div>
                                                        <div className="cart-item-total-price">
                                                            €{(menuItem?.price || 0) * item.quantity}
                                                        </div>
                                                        <IconButton
                                                            className="remove-item-btn"
                                                            onClick={() => removeFromCart(index)}
                                                            size="small"
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="cart-summary-section">
                            <div className="cart-summary-card">
                                <h3 className="summary-title">Order Summary</h3>
                                <Divider sx={{ my: 2 }} />
                                <div className="summary-rows">
                                    <div className="summary-row">
                                        <span>Items ({totalItems})</span>
                                        <span>€{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-row summary-tax">
                                        <span>Tax</span>
                                        <span>Included</span>
                                    </div>
                                </div>
                                <Divider sx={{ my: 2 }} />
                                <div className="summary-total">
                                    <span>Total</span>
                                    <span className="summary-total-amount">€{subtotal.toFixed(2)}</span>
                                </div>
                                <Divider sx={{ my: 2 }} />
                                <div className="summary-actions">
                                    <Button
                                        className="order-btn"
                                        variant="contained"
                                        fullWidth
                                        onClick={handleOrder}
                                        disabled={loading}
                                        sx={{
                                            backgroundColor: 'var(--main-color)',
                                            borderRadius: '12px',
                                            padding: '14px',
                                            fontFamily: 'var(--p-font-family)',
                                            fontWeight: 600,
                                            fontSize: '16px',
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: 'var(--main-color-70)',
                                            },
                                            '&.Mui-disabled': {
                                                backgroundColor: 'var(--grey-30)',
                                            }
                                        }}
                                    >
                                        {loading ? (
                                            <CircularProgress size={20} sx={{ color: 'white' }} />
                                        ) : (
                                            'Place Order'
                                        )}
                                    </Button>
                                    <Button
                                        className="clear-cart-btn"
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => clearCart()}
                                        sx={{
                                            borderColor: 'var(--grey-30)',
                                            color: 'var(--grey-60)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            fontFamily: 'var(--p-font-family)',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            '&:hover': {
                                                borderColor: 'var(--main-color)',
                                                color: 'var(--main-color)',
                                                backgroundColor: 'rgba(195, 98, 65, 0.04)',
                                            }
                                        }}
                                    >
                                        Clear Cart
                                    </Button>
                                </div>
                                <div className="summary-receipt-link">
                                    <Link to="/view-receipt" className="receipt-link">
                                        <ReceiptLong fontSize="small" />
                                        <Translate translationKey="gui.seereceipt" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartPage;
