import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Share2 } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'

function handleShare(image) {
    const url = `${window.location.origin}/banque-images/${image.id}`
    if (navigator.share) {
        navigator.share({ title: image.title, text: `Découvrez cette photo sur Sunu Nataal`, url })
    } else {
        navigator.clipboard.writeText(url).then(() => alert('Lien copié !'))
    }
}

export default function ImageCard({ image }) {
    const { addToCart, toggleFavorite, isFavorite, isInCart } = useCart()
    const [hover, setHover] = useState(false)
    const navigate = useNavigate()
    const liked = isFavorite(image.id)
    const inCart = isInCart(image.id)

    return (
        <div
            className="image-card"
            style={{ marginBottom: 'var(--sp-4)', breakInside: 'avoid', cursor: 'pointer' }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5'
            }}>
                {/* Image link */}
                <Link to={`/banque-images/${image.id}`} style={{ display: 'block' }}>
                    <img
                        src={image.thumbnailUrl || image.url}
                        alt={image.title}
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            transition: 'transform 0.4s ease',
                            transform: hover ? 'scale(1.05)' : 'scale(1)'
                        }}
                    />
                </Link>

                {/* Watermark - subtle */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    overflow: 'hidden', opacity: 0.05
                }}>
                    <div style={{
                        position: 'absolute', inset: '-50%',
                        display: 'flex', flexWrap: 'wrap', gap: '28px',
                        transform: 'rotate(-30deg)', userSelect: 'none'
                    }}>
                        {Array.from({ length: 24 }).map((_, i) => (
                            <span key={i} style={{
                                color: 'white', fontSize: '10px', fontWeight: 700,
                                letterSpacing: '0.15em', textTransform: 'uppercase',
                                whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                            }}>SUNU NATAAL</span>
                        ))}
                    </div>
                </div>

                {/* Hover overlay — clicking blank area navigates to detail */}
                <div
                    style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent 40%, rgba(0,0,0,0.55))',
                        opacity: hover ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: 'var(--sp-3)',
                    }}
                    onClick={() => navigate(`/banque-images/${image.id}`)}
                >
                    {/* Top action buttons — stop propagation so they don't navigate */}
                    <div
                        style={{ alignSelf: 'flex-end', display: 'flex', gap: 'var(--sp-2)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="icon-btn-light"
                            aria-label="Partager"
                            onClick={() => handleShare(image)}
                            title="Partager"
                        >
                            <Share2 size={16} />
                        </button>
                        <button
                            className="icon-btn-light"
                            aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                            onClick={() => toggleFavorite(image.id)}
                            title="Favoris"
                            style={{ color: liked ? 'var(--sn-sand)' : 'white' }}
                        >
                            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            className="icon-btn-light"
                            aria-label={inCart ? 'Dans le panier' : 'Ajouter au panier'}
                            onClick={() => addToCart(image)}
                            title="Ajouter au panier"
                            style={{ color: inCart ? 'var(--sn-sand)' : 'white' }}
                        >
                            <ShoppingCart size={16} />
                        </button>
                    </div>

                    {/* Bottom info */}
                    <div style={{ color: 'white', pointerEvents: 'none' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '2px', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{image.title}</h4>
                        <p style={{ fontSize: '0.8rem', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{image.photographer}</p>
                    </div>
                </div>

                {/* Free/Premium Badge */}
                <div style={{
                    position: 'absolute', top: '8px', left: '8px',
                    background: image.price === 'free' ? 'rgba(0,0,0,0.6)' : 'rgba(212, 165, 116, 0.92)',
                    color: 'white', padding: '2px 6px', borderRadius: '2px',
                    fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase',
                    pointerEvents: 'none'
                }}>
                    {image.price === 'free' ? 'Gratuit' : 'Premium'}
                </div>
            </div>
        </div>
    )
}
