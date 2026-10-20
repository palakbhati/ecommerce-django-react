import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authFetch, getAccessToken } from "../utils/auth";
import { API_URL } from "../utils/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    const clearCart = useCallback(() => {
        setCartItems([]);
        setTotal(0);
    }, []);

    // Load the cart from the backend; resolves to null when logged out or on error
    const loadCart = async () => {
        if (!getAccessToken()) return null;
        try {
            const res = await authFetch(`${API_URL}/api/cart/`);
            return res.ok ? res.json() : null;
        } catch (error) {
            console.error("Error fetching cart:", error);
            return null;
        }
    };

    const applyCart = useCallback((data) => {
        setCartItems(data?.items || []);
        setTotal(Number(data?.total) || 0);
    }, []);

    const fetchCart = useCallback(async () => applyCart(await loadCart()), [applyCart]);

    useEffect(() => {
        loadCart().then(applyCart);
    }, [applyCart]);

    const postToCart = async (path, body) => {
        try {
            const res = await authFetch(`${API_URL}/api/cart/${path}/`, {
                method: "POST",
                body: JSON.stringify(body),
            });
            await fetchCart();
            return res.ok;
        } catch (error) {
            console.error(`Error calling cart/${path}:`, error);
            return false;
        }
    };

    const addToCart = (productId) => postToCart("add", { product_id: productId });

    const removeFromCart = (itemId) => postToCart("remove", { item_id: itemId });

    const updateQuantity = (itemId, quantity) =>
        quantity < 1 ? removeFromCart(itemId) : postToCart("update", { item_id: itemId, quantity });

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ cartItems, total, cartCount, fetchCart, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
