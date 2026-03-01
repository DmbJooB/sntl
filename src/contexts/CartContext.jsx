import React, { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([])
    const [favorites, setFavorites] = useState(new Set())

    const addToCart = useCallback((image) => {
        setCartItems(prev => {
            if (prev.find(i => i.id === image.id)) return prev
            return [...prev, image]
        })
    }, [])

    const removeFromCart = useCallback((id) => {
        setCartItems(prev => prev.filter(i => i.id !== id))
    }, [])

    const toggleFavorite = useCallback((id) => {
        setFavorites(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    const isFavorite = useCallback((id) => favorites.has(id), [favorites])
    const isInCart = useCallback((id) => cartItems.some(i => i.id === id), [cartItems])

    return (
        <CartContext.Provider value={{ cartItems, favorites, addToCart, removeFromCart, toggleFavorite, isFavorite, isInCart }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used inside CartProvider')
    return ctx
}
