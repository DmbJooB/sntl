import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null)

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('sn-cart')
        return saved ? JSON.parse(saved) : []
    })
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('sn-favorites')
        return saved ? new Set(JSON.parse(saved)) : new Set()
    })

    useEffect(() => {
        localStorage.setItem('sn-cart', JSON.stringify(cartItems))
    }, [cartItems])

    useEffect(() => {
        localStorage.setItem('sn-favorites', JSON.stringify(Array.from(favorites)))
    }, [favorites])

    const addToCart = useCallback((itemToAdd) => {
        setCartItems(prev => {
            // Check if exact same item (id + mode + size) is already in cart
            const cartItemId = itemToAdd.cartItemId || `${itemToAdd.id}-${itemToAdd.purchaseMode}-${itemToAdd.selectedOption}`;
            if (prev.find(i => (i.cartItemId || `${i.id}-${i.purchaseMode}-${i.selectedOption}`) === cartItemId)) return prev;
            return [...prev, { ...itemToAdd, cartItemId }];
        })
    }, [])

    const removeFromCart = useCallback((cartItemIdOrId) => {
        setCartItems(prev => prev.filter(i => (i.cartItemId || i.id) !== cartItemIdOrId))
    }, [])

    const toggleFavorite = useCallback((id) => {
        setFavorites(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    const clearCart = useCallback(() => setCartItems([]), [])

    const isFavorite = useCallback((id) => favorites.has(id.toString()), [favorites])
    const isInCart = useCallback((id, purchaseMode, option) => {
        if (!purchaseMode) return cartItems.some(i => i.id.toString() === id.toString());
        const cartItemId = `${id}-${purchaseMode}-${option}`;
        return cartItems.some(i => (i.cartItemId || i.id.toString()) === cartItemId);
    }, [cartItems])

    return (
        <CartContext.Provider value={{
            cartItems,
            favorites,
            addToCart,
            removeFromCart,
            toggleFavorite,
            isFavorite,
            isInCart,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used inside CartProvider')
    return ctx
}
