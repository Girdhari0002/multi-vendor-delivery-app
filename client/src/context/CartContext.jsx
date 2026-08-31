import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // The API returns the raw cart doc (items populated with productId) — it has no `total`
  // field, so it's derived here from each item's populated product price.
  const applyCart = (items) => {
    const safeItems = items || [];
    setCartItems(safeItems);
    setCartCount(safeItems.reduce((acc, item) => acc + item.quantity, 0));
    setCartTotal(
      safeItems.reduce((acc, item) => acc + (item.productId?.price || 0) * item.quantity, 0)
    );
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      applyCart(data.items);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      fetchCart();
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const { data } = await api.post('/cart/add', { productId, quantity });
      applyCart(data.items);
      toast.success('Added to cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  // The backend has no separate "update quantity" route — /cart/add already sets (not
  // increments) the quantity for an existing item, so it doubles as the update endpoint.
  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);
      const { data } = await api.post('/cart/add', { productId, quantity });
      applyCart(data.items);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const { data } = await api.delete('/cart/remove', { data: { productId } });
      applyCart(data.items);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
    setCartTotal(0);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        cartCount, 
        cartTotal, 
        loading, 
        fetchCart, 
        addToCart, 
        updateCartItem, 
        removeFromCart, 
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
