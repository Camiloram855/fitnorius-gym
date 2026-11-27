/* eslint-disable react-refresh/only-export-components */
// src/context/CartContext.jsx
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartAddition, setCartAddition] = useState(0);

  const addToCart = (product) => {
    if (!product || product.agotado) {
      return;
    }

    setCartAddition((value) => value + 1);
    const quantity = Math.max(1, Math.trunc(Number(product.quantity) || 1));
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item);
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const changeQuantity = (id, delta) => {
    if (!Number.isInteger(delta)) return;
    setCartItems((prev) => prev.map((item) => item.id === id
      ? { ...item, quantity: Math.max(1, item.quantity + delta) }
      : item));
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, cartAddition, addToCart, changeQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
