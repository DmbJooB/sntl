import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getWalks, getBankImages, getUsers, getAppearanceSettings } from '../services/db'

function useInView(ref) {
    const [inView, setInView] = useState(false)
    useEffect(() => {
        if (!ref.current) return
        const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.15 })
        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [ref])
    return inView
}

function Section({ children, className = '' }) {
    const ref = useRef(null)
    const inView = useInView(ref)
    return (
        <section ref={ref} className={`section ${className}`} style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s cubic-bezier(.16,1,.3,1)' }}>
            {children}
        </section>
    )
}

/* ═══════ HERO ═══════ */
function Hero() {
    const [offset, setOffset] = useState(0)
    const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1920&h=1080&fit=crop')

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await getAppearanceSettings()
                // Reject blob: URLs (they expire across sessions/ports) and use fallback
                if (settings && settings.homeCover && !settings.homeCover.startsWith('blob:')) {
                    setCoverImage(settings.homeCover)
                }
            } catch (error) {
                console.error("Error fetching appearance settings for Hero:", error)
            }
        }
        fetchSettings()
    }, [])

    useEffect(() => {
        const handleScroll = () => setOffset(window.scrollY * 0.4)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div style={{
            position: 'relative',
            height: '100vh',
            minHeight: '600px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `translateY(${offset}px) scale(1.1)`,
                transition: 'transform 0.1s linear',
                filter: 'brightness(0.55)'
            }} />
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.6) 100%)'
            }} />
            <div style={{
                position: 'relative',
                zIndex: 2,
                textAlign: 'center',
                color: 'white',
                maxWidth: '720px',
                padding: '0 var(--sp-6)'
            }}>
                <p className="text-uppercase animate-fadeInUp" style={{ color: 'var(--sn-sand-light)', marginBottom: 'var(--sp-4)', fontSize: '0.8rem' }}>
                    Collectif Photographique · Dakar, Sénégal
                </p>
                <h1 className="animate-fadeInUp animate-delay-1" style={{
                    color: 'white',
                    fontSize: 'clamp(2.8rem, 7vw, 5rem)',
                    fontWeight: 900,
                    marginBottom: 'var(--sp-6)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.03em'
                }}>
                    Sunu Nataal
                </h1>
                <p className="animate-fadeInUp animate-delay-2" style={{
                    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                    color: 'rgba(255,255,255,0.85)',
                    marginBottom: 'var(--sp-8)',
                    lineHeight: 1.6,
                    fontWeight: 300
                }}>
                    Explorons le Sénégal à travers l'objectif.<br />
                    Randonnées photo · Expositions · Banque d'images
                </p>
                <div className="animate-fadeInUp animate-delay-3" style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/evenements" className="btn btn-primary" style={{ fontSize: '1rem', padding: 'var(--sp-4) var(--sp-8)' }}>
                        Prochaine Randonnée →
                    </Link>
                    <Link to="/banque-images" className="btn btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', fontSize: '1rem', padding: 'var(--sp-4) var(--sp-8)' }}>
                        Banque d'Images
                    </Link>
                </div>
            </div>
            {/* scroll indicator */}
            <div className="animate-fadeIn animate-delay-4" style={{
                position: 'absolute',
                bottom: 'var(--sp-8)',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--sp-2)',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-accent)'
            }}>
                <span>Défiler</span>
                <div style={{
                    width: 1, height: 40,
                    background: 'linear-gradient(rgba(255,255,255,0.4), transparent)'
                }} />
            </div>
        </div>
    )
}

/* ═══════ UPCOMING WALKS ═══════ */
function UpcomingWalks({ walks, loading }) {
    const upcoming = walks.filter(w => w.status === 'upcoming')

    if (!loading && upcoming.length === 0) return null;

    return (
        <div className="container" style={{ paddingTop: 'var(--sp-8)', paddingBottom: 'var(--sp-8)', borderBottom: '1px solid var(--sn-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
                <h4 className="text-uppercase" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--sn-gray)', letterSpacing: '0.1em' }}>
                    📅 &nbsp; Prochainement
                </h4>
                <Link to="/randonnees" className="text-small" style={{ fontFamily: 'var(--font-accent)', fontWeight: 600, color: 'var(--sn-sand)' }}>
                    Voir tout →
                </Link>
            </div>

            {loading ? (
                <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ width: 280, height: 70, borderRadius: 'var(--radius-md)', background: 'var(--sn-border)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))}
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    gap: 'var(--sp-3)',
                    overflowX: 'auto',
                    paddingBottom: '4px'
                }} className="upcoming-scroll">
                    {upcoming.map((walk, i) => (
                        <Link to={`/randonnees/${walk.slug}`} key={walk.id} className="card" style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 'var(--sp-3)',
                            padding: 0,
                            overflow: 'hidden',
                            flexShrink: 0,
                            width: '280px',
                            border: 'none',
                            background: 'transparent'
                        }}>
                            <img src={walk.cover} alt={walk.title} style={{
                                width: 70, height: 70,
                                objectFit: 'cover',
                                flexShrink: 0,
                                borderRadius: 'var(--radius-md)'
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: '2px' }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--sn-sand)',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-accent)',
                                        textTransform: 'uppercase'
                                    }}>
                                        {new Date(walk.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{walk.title}</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--sn-gray-light)', margin: 0 }}>
                                    {walk.location}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            <style>{`
                .upcoming-scroll::-webkit-scrollbar { height: 4px; }
                .upcoming-scroll::-webkit-scrollbar-track { background: transparent; }
                .upcoming-scroll::-webkit-scrollbar-thumb { background: var(--sn-border); border-radius: 4px; }
                @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
            `}</style>
        </div>
    )
}

/* ═══════ LATEST PHOTOS MASONRY ═══════ */
function LatestPhotos({ photosData, loading }) {
    const [lightbox, setLightbox] = useState(null)
    const photos = photosData.slice(0, 8)

    return (
        <Section>
            <div className="container">
                <div className="section-header">
                    <div>
                        <p className="text-uppercase text-sand" style={{ marginBottom: 'var(--sp-2)' }}>Galerie</p>
                        <h2>Dernières Photos</h2>
                    </div>
                    <Link to="/feed" className="section-link">Voir le feed →</Link>
                </div>
                {loading ? (
                    <div className="masonry">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="masonry-item" style={{ background: 'var(--sn-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        ))}
                    </div>
                ) : (
                    <div className="masonry">
                        {photos.map((photo, i) => (
                            <div key={photo.id} className="masonry-item" onClick={() => setLightbox(photo)} style={{ animationDelay: `${i * 80}ms`, animation: 'fadeInUp 0.6s cubic-bezier(.16,1,.3,1) both' }}>
                                <img src={photo.url} alt={photo.title} loading="lazy" />
                                <div className="masonry-overlay">
                                    <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.85rem', fontWeight: 600 }}>{photo.photographer}</p>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{photo.location || photo.category}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {lightbox && (
                <div className="lightbox-backdrop" onClick={() => setLightbox(null)}>
                    <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
                    <img src={lightbox.url} alt={lightbox.title} className="lightbox-image" onClick={e => e.stopPropagation()} />
                    <div className="lightbox-info">
                        <h4>{lightbox.title}</h4>
                        <p>par {lightbox.photographer}</p>
                    </div>
                </div>
            )}
        </Section>
    )
}

/* ═══════ HIGHLIGHTED PHOTOGRAPHERS ═══════ */
function HighlightedPhotographers({ photographers, loading }) {
    const featured = photographers.filter(p => p.featured)
    return (
        <div className="container" style={{ paddingTop: 'var(--sp-6)', paddingBottom: 'var(--sp-6)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
                <h4 className="text-uppercase" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--sn-gray)', letterSpacing: '0.1em' }}>
                    👥 &nbsp; Le Collectif
                </h4>
                <Link to="/photographes" className="text-small" style={{ fontFamily: 'var(--font-accent)', fontWeight: 600, color: 'var(--sn-sand)' }}>
                    Voir tous →
                </Link>
            </div>

            <div style={{
                display: 'flex',
                gap: 'var(--sp-4)',
                overflowX: 'auto',
                paddingBottom: '4px'
            }} className="photographers-scroll">
                {loading ? (
                    [1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ width: 140, height: 100, borderRadius: 'var(--radius-md)', background: 'var(--sn-border)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))
                ) : (
                    featured.map((p, i) => (
                        <Link to={`/photographes/${p.slug}`} key={p.id} className="card" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            padding: 'var(--sp-3)',
                            gap: 'var(--sp-2)',
                            minWidth: '140px',
                            width: '140px',
                            flexShrink: 0,
                            border: 'none',
                            background: 'transparent'
                        }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img src={p.avatar} alt={p.name} style={{
                                    width: 64, height: 64,
                                    borderRadius: 'var(--radius-full)',
                                    objectFit: 'cover',
                                    border: '2px solid var(--sn-sand-pale)'
                                }} />
                                {p.isMember && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0, right: 0,
                                        background: 'var(--sn-black)',
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '2px solid white',
                                        padding: '2px'
                                    }} title="Membre Sunu Nataal">
                                        <img src="/images/logo_sntl.png" alt="SNTL Member" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                                    </div>
                                )}
                            </div>
                            <div style={{ width: '100%' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                                <p style={{ fontSize: '0.7rem', color: 'var(--sn-sand)', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {p.speciality}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
            <style>{`
                .photographers-scroll::-webkit-scrollbar { height: 4px; }
                .photographers-scroll::-webkit-scrollbar-track { background: transparent; }
                .photographers-scroll::-webkit-scrollbar-thumb { background: var(--sn-border); border-radius: 4px; }
            `}</style>
        </div>
    )
}

/* ═══════ FEATURED IMAGE BANK ═══════ */
function FeaturedImageBank({ bankImages, loading }) {
    const featured = bankImages.slice(0, 6)
    return (
        <div className="container" style={{ paddingTop: 'var(--sp-6)', paddingBottom: 'var(--sp-6)', borderBottom: '1px solid var(--sn-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
                <h4 className="text-uppercase" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--sn-gray)', letterSpacing: '0.1em' }}>
                    🖼️ &nbsp; Banque d'Images
                </h4>
                <Link to="/banque-images" className="text-small" style={{ fontFamily: 'var(--font-accent)', fontWeight: 600, color: 'var(--sn-sand)' }}>
                    Explorer →
                </Link>
            </div>

            <div style={{
                display: 'flex',
                gap: 'var(--sp-4)',
                overflowX: 'auto',
                paddingBottom: '4px'
            }} className="bank-scroll">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} style={{ width: 220, height: 165, borderRadius: 'var(--radius-md)', background: 'var(--sn-border)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))
                ) : (
                    featured.map((img, i) => (
                        <Link to={`/banque-images/${img.id}`} key={img.id} className="card" style={{
                            minWidth: '220px',
                            width: '220px',
                            flexShrink: 0,
                            padding: 0,
                            overflow: 'hidden',
                            border: 'none',
                            background: 'transparent'
                        }}>
                            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md)', aspectRatio: '4/3', marginBottom: 'var(--sp-2)' }}>
                                <img src={img.thumbnailUrl || img.url} alt={img.title} className="card-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {img.price === 'free' && (
                                    <div className="watermark-overlay" style={{ opacity: 0.3 }}>
                                        <div className="watermark-pattern" style={{ fontSize: '0.6rem' }}>
                                            {Array.from({ length: 10 }).map((_, j) => (
                                                <span key={j}>SUNU NATAAL</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    top: 'var(--sp-2)',
                                    right: 'var(--sp-2)'
                                }}>
                                    <span className={`badge ${img.price === 'free' ? 'badge-free' : 'badge-premium'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                                        {img.price === 'free' ? '🆓' : '⭐'}
                                    </span>
                                </div>
                            </div>
                            <div className="card-body" style={{ padding: '0 var(--sp-1)' }}>
                                <h4 style={{ marginBottom: '2px', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.title}</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--sn-gray-light)', margin: 0 }}>
                                    par {img.photographer}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
            <style>{`
                .bank-scroll::-webkit-scrollbar { height: 4px; }
                .bank-scroll::-webkit-scrollbar-track { background: transparent; }
                .bank-scroll::-webkit-scrollbar-thumb { background: var(--sn-border); border-radius: 4px; }
            `}</style>
        </div>
    )
}

/* ═══════ CTA BANNER ═══════ */
function CTABanner() {
    return (
        <Section>
            <div className="container">
                <div style={{
                    background: 'var(--sn-black)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--sp-16) var(--sp-8)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-20%',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, var(--sn-sand) 0%, transparent 70%)',
                        opacity: 0.08
                    }} />
                    <p className="text-uppercase" style={{ color: 'var(--sn-sand)', marginBottom: 'var(--sp-4)' }}>Rejoignez-nous</p>
                    <h2 style={{ color: 'white', marginBottom: 'var(--sp-4)', maxWidth: '500px', margin: '0 auto var(--sp-4)' }}>
                        Devenez membre du collectif
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '460px', margin: '0 auto var(--sp-8)', fontSize: '1rem' }}>
                        Participez aux randonnées, publiez vos photos, exposez votre travail et vendez vos images sur notre plateforme.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/login" className="btn btn-primary" style={{ fontSize: '1rem', padding: 'var(--sp-4) var(--sp-10)' }}>
                            Devenir Photographe
                        </Link>
                        <Link to="/login" className="btn btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                            S'inscrire comme participant
                        </Link>
                    </div>
                </div>
            </div>
        </Section>
    )
}

/* ═══════ HOME PAGE ═══════ */
export default function HomePage() {
    const [walks, setWalks] = useState([])
    const [photographers, setPhotographers] = useState([])
    const [bankImages, setBankImages] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch data in the background without blocking the Hero from rendering.
        // Each data source resolves independently, and the fallback in db.js ensures
        // mock data is shown if Firestore is unavailable.
        const fetchAll = async () => {
            const [w, b, u] = await Promise.all([
                getWalks(),
                getBankImages(),
                getUsers()
            ])
            setWalks(w)
            setBankImages(b)
            setPhotographers(u)
            setLoading(false)
        }
        fetchAll()
    }, [])

    // No full-screen loading state — Hero renders immediately.
    // Data sections show skeleton placeholders while loading.
    return (
        <>
            <Hero />
            <UpcomingWalks walks={walks} loading={loading} />
            <LatestPhotos photosData={bankImages} loading={loading} />
            <HighlightedPhotographers photographers={photographers} loading={loading} />
            <FeaturedImageBank bankImages={bankImages} loading={loading} />
            <CTABanner />
        </>
    )
}
