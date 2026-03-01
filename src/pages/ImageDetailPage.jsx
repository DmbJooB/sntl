import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getImageById, getUserById, getBankImages } from '../services/db'
import { Download, ShoppingCart, Heart, Share2, Info, ChevronRight, ShieldCheck, Printer } from 'lucide-react'
import ImageCard from '../components/image-bank/ImageCard'
import { useCart } from '../contexts/CartContext'

const PriceOption = ({ label, resolution, price, selected, onSelect }) => (
    <div
        onClick={onSelect}
        style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--sp-3)',
            border: selected ? '2px solid var(--sn-black)' : '1px solid var(--sn-border)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            marginBottom: 'var(--sp-2)',
            background: selected ? 'rgba(0,0,0,0.02)' : 'white',
            transition: 'all 0.2s ease'
        }}
    >
        <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
            <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: selected ? '5px solid var(--sn-black)' : '2px solid var(--sn-gray-light)',
                flexShrink: 0
            }} />
            <div>
                <span style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--sn-gray)' }}>{resolution}</span>
            </div>
        </div>
        <span style={{ fontWeight: 700 }}>{price}</span>
    </div>
)

export default function ImageDetailPage() {
    const { id } = useParams()
    const [image, setImage] = useState(null)
    const [photographer, setPhotographer] = useState(null)
    const [related, setRelated] = useState([])
    const [loading, setLoading] = useState(true)
    const { addToCart, toggleFavorite, isFavorite, isInCart } = useCart()

    const [purchaseMode, setPurchaseMode] = useState('digital')
    const [selectedDigitalOption, setSelectedDigitalOption] = useState('large')
    const [selectedPrintOption, setSelectedPrintOption] = useState('a3')

    useEffect(() => {
        const fetchImageDetails = async () => {
            try {
                const fetchedImage = await getImageById(id)
                if (fetchedImage) {
                    setImage(fetchedImage)
                    if (fetchedImage.photographerId) {
                        const fetchedPhotographer = await getUserById(fetchedImage.photographerId.toString())
                        setPhotographer(fetchedPhotographer)
                    }
                    const allImages = await getBankImages()
                    const relatedImages = allImages.filter(i =>
                        i.id !== fetchedImage.id &&
                        (i.category === fetchedImage.category || i.photographerId === fetchedImage.photographerId)
                    ).slice(0, 4)
                    setRelated(relatedImages)
                }
            } catch (error) {
                console.error("Error fetching image details:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchImageDetails()
    }, [id])

    if (loading) return <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', textAlign: 'center' }}>Chargement...</div>
    if (!image) return <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', textAlign: 'center' }}>Image non trouvée</div>


    return (
        <div style={{ paddingTop: 'var(--header-height)', background: 'white', minHeight: '100vh' }}>

            {/* Breadcrumb / Top Bar */}
            <div style={{ borderBottom: '1px solid var(--sn-border)', padding: 'var(--sp-3) 0' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: '0.85rem', color: 'var(--sn-gray)' }}>
                    <Link to="/banque-images" className="hover:text-black">Banque d'images</Link>
                    <ChevronRight size={14} />
                    <span>{image.category}</span>
                    <ChevronRight size={14} />
                    <span style={{ color: 'var(--sn-black)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        {image.title}
                    </span>
                </div>
            </div>

            <div className="container section" style={{ paddingTop: 'var(--sp-8)' }}>
                <div className="detail-grid">

                    {/* LEFT COLUMN: IMAGE */}
                    <div style={{ minWidth: 0 }}> {/* minWidth 0 fixes grid overflow issues */}
                        <div style={{
                            background: '#f3f3f3',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--sp-4)', // Padding around image like Getty
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 'var(--sp-6)'
                        }}>
                            <div style={{ position: 'relative', display: 'inline-block', maxHeight: '70vh' }}>
                                <img
                                    src={image.url}
                                    alt={image.title}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '70vh',
                                        display: 'block',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                    }}
                                />
                                {/* Watermark for free/preview */}
                                <div className="watermark-overlay" style={{ opacity: 0.12 }}>
                                    <div className="watermark-pattern" style={{ gap: '80px', opacity: 1 }}>
                                        {Array.from({ length: 8 }).map((_, j) => (
                                            <span key={j}>SUNU NATAAL</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Title & Keywords (Desktop) */}
                        <div className="hide-mobile">
                            <h1 style={{ fontSize: '1.8rem', marginBottom: 'var(--sp-2)' }}>{image.title}</h1>
                            <p style={{ color: 'var(--sn-gray)', marginBottom: 'var(--sp-6)' }}>
                                {image.location} • Photographie par <Link to={`/photographes/${photographer?.slug}`} style={{ color: 'var(--sn-sand)', fontWeight: 500 }}>{photographer?.name}</Link>
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                                {['Sénégal', 'Afrique', 'Tourisme', 'Culture', image.category, image.orientation].map(tag => (
                                    <span key={tag} style={{
                                        background: '#f3f3f3',
                                        padding: '4px 12px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        color: '#555',
                                        cursor: 'pointer'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SIDEBAR */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            position: 'sticky',
                            top: 'calc(var(--header-height) + var(--sp-6))',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--sp-6)'
                        }}>
                            {/* License/Price Box */}
                            <div style={{ border: '1px solid var(--sn-border)', padding: 'var(--sp-5)', borderRadius: 'var(--radius-md)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--sp-4)' }}>
                                    {image.price === 'free' ? 'Téléchargement Gratuit' : 'Acheter cette image'}
                                </h3>

                                {image.price === 'free' ? (
                                    <div style={{ marginBottom: 'var(--sp-4)', fontSize: '0.9rem', color: '#555' }}>
                                        <p style={{ marginBottom: 'var(--sp-2)' }}>Cette image est gratuite pour un usage personnel et commercial avec attribution.</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--sn-success)', fontWeight: 500 }}>
                                            <ShieldCheck size={18} /> Licence Standard incluse
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Purchase Mode Toggle */}
                                        <div style={{
                                            display: 'flex',
                                            padding: '4px',
                                            background: '#f3f3f3',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: 'var(--sp-4)'
                                        }}>
                                            <button
                                                onClick={() => setPurchaseMode('digital')}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    border: 'none',
                                                    background: purchaseMode === 'digital' ? 'white' : 'transparent',
                                                    boxShadow: purchaseMode === 'digital' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontWeight: purchaseMode === 'digital' ? 600 : 500,
                                                    color: purchaseMode === 'digital' ? 'var(--sn-black)' : 'var(--sn-gray)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Download size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} /> Numérique
                                            </button>
                                            <button
                                                onClick={() => setPurchaseMode('print')}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    border: 'none',
                                                    background: purchaseMode === 'print' ? 'white' : 'transparent',
                                                    boxShadow: purchaseMode === 'print' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontWeight: purchaseMode === 'print' ? 600 : 500,
                                                    color: purchaseMode === 'print' ? 'var(--sn-black)' : 'var(--sn-gray)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Printer size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} /> Impression
                                            </button>
                                        </div>

                                        <div style={{ marginBottom: 'var(--sp-5)' }}>
                                            {purchaseMode === 'digital' ? (
                                                <>
                                                    <PriceOption
                                                        label="Petite"
                                                        resolution="800 x 600 px • 72 dpi"
                                                        price="15.000 FCFA"
                                                        selected={selectedDigitalOption === 'small'}
                                                        onSelect={() => setSelectedDigitalOption('small')}
                                                    />
                                                    <PriceOption
                                                        label="Moyenne"
                                                        resolution="2400 x 1600 px • 300 dpi"
                                                        price="35.000 FCFA"
                                                        selected={selectedDigitalOption === 'medium'}
                                                        onSelect={() => setSelectedDigitalOption('medium')}
                                                    />
                                                    <PriceOption
                                                        label="Grande"
                                                        resolution="Originale (24MP) • 300 dpi"
                                                        price="65.000 FCFA"
                                                        selected={selectedDigitalOption === 'large'}
                                                        onSelect={() => setSelectedDigitalOption('large')}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <PriceOption
                                                        label="Poster A4"
                                                        resolution="21 x 29.7 cm • Papier Fine Art"
                                                        price="25.000 FCFA"
                                                        selected={selectedPrintOption === 'a4'}
                                                        onSelect={() => setSelectedPrintOption('a4')}
                                                    />
                                                    <PriceOption
                                                        label="Tirage Premium A3"
                                                        resolution="29.7 x 42 cm • Papier Fine Art"
                                                        price="45.000 FCFA"
                                                        selected={selectedPrintOption === 'a3'}
                                                        onSelect={() => setSelectedPrintOption('a3')}
                                                    />
                                                    <PriceOption
                                                        label="Toile sur châssis"
                                                        resolution="50 x 70 cm • Prêt à accrocher"
                                                        price="85.000 FCFA"
                                                        selected={selectedPrintOption === 'canvas'}
                                                        onSelect={() => setSelectedPrintOption('canvas')}
                                                    />
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', textAlign: 'center', marginTop: 'var(--sp-3)' }}>
                                                        <Info size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                                                        Livraison en 3 à 5 jours ouvrés.
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div style={{ display: 'flex', gap: 'var(--sp-3)', flexDirection: 'column' }}>
                                    {image.price === 'free' ? (
                                        <button
                                            className="btn-dark"
                                            style={{ width: '100%', justifyContent: 'center' }}
                                            onClick={() => {
                                                const a = document.createElement('a')
                                                a.href = image.url
                                                a.download = `sunu-nataal-${image.id}.jpg`
                                                a.click()
                                            }}
                                        >
                                            <Download size={20} /> Télécharger gratuitement
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-primary"
                                            style={{ width: '100%', justifyContent: 'center' }}
                                            onClick={() => addToCart(image)}
                                        >
                                            <ShoppingCart size={20} />
                                            {isInCart(image.id) ? '✓ Dans le panier' : 'Ajouter au panier'}
                                        </button>
                                    )}

                                    <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                                        <button
                                            className="btn-secondary"
                                            style={{ flex: 1, justifyContent: 'center', color: isFavorite(image.id) ? 'var(--sn-sand)' : undefined }}
                                            onClick={() => toggleFavorite(image.id)}
                                        >
                                            <Heart size={18} fill={isFavorite(image.id) ? 'currentColor' : 'none'} />
                                            {isFavorite(image.id) ? 'Sauvegardé' : 'Sauvegarder'}
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            style={{ flex: 1, justifyContent: 'center' }}
                                            onClick={() => {
                                                const url = window.location.href
                                                if (navigator.share) {
                                                    navigator.share({ title: image.title, url })
                                                } else {
                                                    navigator.clipboard.writeText(url).then(() => alert('Lien copié !'))
                                                }
                                            }}
                                        >
                                            <Share2 size={18} /> Partager
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Details Box */}
                            <div style={{ background: '#f9f9f9', padding: 'var(--sp-5)', borderRadius: 'var(--radius-md)' }}>
                                <h4 style={{ fontSize: '0.95rem', marginBottom: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Info size={16} /> Détails de l'image
                                </h4>
                                <dl style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px 0', fontSize: '0.85rem' }}>
                                    <dt style={{ color: 'var(--sn-gray)' }}>ID</dt>
                                    <dd>#{image.id.toString().padStart(8, '0')}</dd>

                                    <dt style={{ color: 'var(--sn-gray)' }}>Photographe</dt>
                                    <dd>{photographer?.name}</dd>

                                    <dt style={{ color: 'var(--sn-gray)' }}>Date</dt>
                                    <dd>12 Fév, 2026</dd>

                                    <dt style={{ color: 'var(--sn-gray)' }}>Licence</dt>
                                    <dd>{image.price === 'free' ? 'Attribution requise' : 'Libre de droits'}</dd>
                                </dl>
                            </div>

                            {/* Photographer Mini Profile */}
                            {photographer && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                                    <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
                                        <img src={photographer.avatar} alt="" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                                        {photographer.isMember && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: -2, right: -2,
                                                background: 'var(--sn-black)',
                                                borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: '1px solid white',
                                                padding: '2px',
                                                zIndex: 2
                                            }} title="Membre Sunu Nataal">
                                                <img src="/images/logo_sntl.png" alt="SNTL Member" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{photographer.name}</div>
                                        <Link to={`/photographes/${photographer.slug}`} style={{ fontSize: '0.85rem', color: 'var(--sn-sand)' }}>
                                            Voir le portfolio
                                        </Link>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Related Images */}
                <div style={{ marginTop: 'var(--sp-20)', borderTop: '1px solid var(--sn-border)', paddingTop: 'var(--sp-10)' }}>
                    <h3 style={{ marginBottom: 'var(--sp-6)' }}>Images similaires</h3>
                    <div className="masonry" style={{ columns: '4 280px' }}>
                        {related.map(img => (
                            <div key={img.id} className="masonry-item">
                                <ImageCard image={img} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 360px;
                    gap: var(--sp-8);
                    align-items: start;
                }
                @media (max-width: 900px) {
                    .detail-grid {
                        grid-template-columns: 1fr;
                    }
                    .hide-mobile {
                        display: none;
                    }
                }
            `}</style>
        </div>
    )
}

