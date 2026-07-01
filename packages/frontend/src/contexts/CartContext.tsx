import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { CartItem } from '../models/CartItem';
import { orderService } from '../services/OrderService';
import { menuItemService } from '../services/MenuItemService';
import { showErrorPopup, showSuccessPopup, showLoadingPopup, hideLoadingPopup } from '../utils/popupUtils';
import { MenuItem } from '../models/MenuItem';

interface CartContextType {
    cart: CartItem[];
    menuItems: { [key: string]: MenuItem };
    addToCart: (item: CartItem) => void;
    updateCart: (newCart: CartItem[]) => void;
    clearCart: () => void;
    order: (tableId?: number) => Promise<void>;
    fetchMenuItems: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
    cart: [],
    menuItems: {},
    addToCart: () => { },
    updateCart: () => { },
    clearCart: () => { },
    order: async (tableId?: number) => { },
    fetchMenuItems: async () => { },
});

export const useCart = () => useContext(CartContext);

interface Props {
    children: ReactNode;
}

export const CartProvider: React.FC<Props> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    });

    const [menuItems, setMenuItems] = useState<{ [key: string]: MenuItem }>({});

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const fetchMenuItems = useCallback(async () => {
        showLoadingPopup('Loading your cart...');
        try {
            const menuItemsData: { [key: string]: MenuItem } = {};
            await Promise.all(
                cart.map(async (cartItem) => {
                    const data = await menuItemService.get(cartItem.id);
                    menuItemsData[cartItem.id] = data;
                })
            );
            setMenuItems(menuItemsData);
        } catch (error) {
            console.error('Error fetching menu item data:', error);
            showErrorPopup('Failed to load cart items. Please try again later.');
        } finally {
            hideLoadingPopup();
        }
    }, [cart]);

    const addToCart = useCallback((item: CartItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id && cartItem.annotations === item.annotations);
            if (existingItem) {
                showSuccessPopup(`Increased quantity of ${item.id} in the cart.`);
                return prevCart.map(cartItem =>
                    cartItem.id === item.id && cartItem.annotations === item.annotations
                        ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                        : cartItem
                );
            } else {
                showSuccessPopup(`Added ${item.id} to the cart.`);
                return [...prevCart, item];
            }
        });
    }, []);

    const updateCart = useCallback((newCart: CartItem[]) => {
        setCart(newCart);
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const order = useCallback(async (tableId?: number) => {
        showLoadingPopup('Processing your order...');
        try {
            await orderService.order(cart, tableId);
            setCart([]);
            showSuccessPopup('Order placed successfully!');
        } catch (error) {
            console.error('Error placing order:', error);
            showErrorPopup('Failed to place the order. Please try again.');
        } finally {
            hideLoadingPopup();
        }
    }, [cart]);

    const contextValue = useMemo(() => ({
        cart,
        menuItems,
        addToCart,
        updateCart,
        clearCart,
        order,
        fetchMenuItems
    }), [cart, menuItems, addToCart, updateCart, clearCart, order, fetchMenuItems]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};
