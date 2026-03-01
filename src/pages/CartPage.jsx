import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ChevronLeft, ShoppingBag, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

export default function CartPage() {
    const { cartItems, removeFromCart, clearCart } = useCart()
    const navigate = useNavigate()

    const subtotal = cartItems.reduce((acc, item) => {
        const price = item.customPrice || (item.price === 'premium' ? 35000 : 0)
        return acc + price
    }, 0)

    const total = subtotal

    if (cartItems.length === 0) {
        return (
            <div style={{ paddingTop: 'var(--header-height)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="container" style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{
                        width: '80px', height: '80px', background: '#f5f5f5',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto var(--sp-6)'
                    }}>
                        <ShoppingBag size={40} style={{ color: 'var(--sn-gray)' }} />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: 'var(--sp-4)' }}>Votre panier est vide</h1>
                    <p style={{ color: 'var(--sn-gray)', marginBottom: 'var(--sp-8)' }}>
                        Découvrez notre banque d'images et trouvez les perles rares pour vos projets.
                    </p>
                    <Link to="/banque-images" className="btn-primary" style={{ display: 'inline-flex' }}>
                        Explorer la banque d'images
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div style={{ paddingTop: 'var(--header-height)', background: '#fcfcfc', minHeight: '100vh' }}>
            <div className="container section">
                <div style={{ marginBottom: 'var(--sp-8)' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sn-gray)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                    >
                        <ChevronLeft size={16} /> Retour
                    </button>
                    <h1 style={{ fontSize: '2.5rem', marginTop: 'var(--sp-4)' }}>Mon Panier</h1>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--sp-10)', alignItems: 'start' }} className="cart-grid">
                    {/* Items List */}
                    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border)', overflow: 'hidden' }}>
                        <div style={{ padding: 'var(--sp-4) var(--sp-6)', borderBottom: '1px solid var(--sn-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600 }}>{cartItems.length} article(s)</span>
                            <button
                                onClick={clearCart}
                                style={{ background: 'none', border: 'none', color: 'var(--sn-error)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}
                            >
                                Vider le panier
                            </button>
                        </div>

                        <div style={{ padding: '0 var(--sp-6)' }}>
                            {cartItems.map((item, idx) => (
                                <div key={item.id} style={{
                                    padding: 'var(--sp-6) 0',
                                    borderBottom: idx === cartItems.length - 1 ? 'none' : '1px solid #eee',
                                    display: 'flex',
                                    gap: 'var(--sp-6)'
                                }}>
                                    <div style={{ width: '120px', height: '90px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, background: '#f5f5f5' }}>
                                        <img src={item.thumbnailUrl || item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{item.title}</h3>
                                            <span style={{ fontWeight: 700 }}>
                                                {item.customPrice !== undefined ? `${item.customPrice.toLocaleString()} FCFA` : (item.price === 'premium' ? '35.000 FCFA' : '0 FCFA')}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-3)' }}>
                                            Par {item.photographer} • {item.formatLabel || 'Licence Standard'}
                                        </p>
                                        <button
                                            onClick={() => removeFromCart(item.cartItemId || item.id)}
                                            style={{ background: 'none', border: 'none', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                                        >
                                            <Trash2 size={14} /> Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--sp-6))' }}>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border)', padding: 'var(--sp-6)' }}>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--sp-6)' }}>Récapitulatif</h2>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-3)', fontSize: '0.95rem' }}>
                                <span style={{ color: 'var(--sn-gray)' }}>Sous-total</span>
                                <span>{subtotal.toLocaleString()} FCFA</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-6)', fontSize: '0.95rem' }}>
                                <span style={{ color: 'var(--sn-gray)' }}>TVA (18%)</span>
                                <span>Inclus</span>
                            </div>

                            <div style={{ borderTop: '1px solid var(--sn-border)', paddingTop: 'var(--sp-4)', marginBottom: 'var(--sp-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600 }}>Total</span>
                                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sn-sand)' }}>{total.toLocaleString()} FCFA</span>
                            </div>

                            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}>
                                Passer à la caisse <ArrowRight size={18} />
                            </button>

                            <div style={{ marginTop: 'var(--sp-6)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--sn-gray)' }}>
                                    <ShieldCheck size={16} /> Paiement 100% sécurisé
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--sn-gray)' }}>
                                    <CreditCard size={16} /> Orange Money, Wave, CB
                                </div>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.8rem', color: '#999', marginTop: 'var(--sp-4)', textAlign: 'center', padding: '0 var(--sp-4)' }}>
                            En passant commande, vous acceptez nos conditions générales de vente et les termes des licences d'utilisation.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .cart-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    )
}
