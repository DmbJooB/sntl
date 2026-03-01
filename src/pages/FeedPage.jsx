import React, { useState, useEffect, useCallback } from 'react'
import { getBankImages, getWalks } from '../services/db'

export default function FeedPage() {
    const batchSize = 8
    const [feedImages, setFeedImages] = useState([])
    const [visible, setVisible] = useState(batchSize)
    const [likedIds, setLikedIds] = useState(new Set())
    const [lightbox, setLightbox] = useState(null)
    const [initialLoading, setInitialLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const bankImgs = await getBankImages()
                const walks = await getWalks()

                const combined = [
                    ...bankImgs.map(img => ({ ...img, id: `bank_${img.id}`, likes: Math.floor(Math.random() * 200) + 20, timestamp: `Il y a ${Math.floor(Math.random() * 48) + 1}h` })),
                    ...walks.flatMap(w => (w.photos || []).map((p, i) => ({
                        id: `walk_${w.id}_${i}`,
                        title: `${w.title} #${i + 1}`,
                        url: p.url,
                        thumbnailUrl: p.url,
                        photographer: p.photographer,
                        category: w.category || 'Randonnée',
                        location: w.location,
                        likes: Math.floor(Math.random() * 150) + 10,
                        timestamp: `Il y a ${Math.floor(Math.random() * 72) + 1}h`
                    })))
                ];

                // Shuffle array (simulate real feed mix)
                combined.sort(() => Math.random() - 0.5)

                setFeedImages(combined)
            } catch (error) {
                console.error("Error fetching feed:", error)
            } finally {
                setInitialLoading(false)
            }
        }
        fetchFeed()
    }, [])

    const loadMore = useCallback(() => {
        if (loadingMore || visible >= feedImages.length) return
        setLoadingMore(true)
        setTimeout(() => {
            setVisible(v => Math.min(v + batchSize, feedImages.length))
            setLoadingMore(false)
        }, 600)
    }, [loadingMore, visible, feedImages.length])

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
                loadMore()
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [loadMore])

    const toggleLike = (e, id) => {
        e.stopPropagation()
        setLikedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const visibleImages = feedImages.slice(0, visible)

    if (initialLoading) return (
        <div style={{ paddingTop: 'var(--header-height)' }}>
            <div style={{ background: 'var(--sn-black)', padding: 'var(--sp-12) 0 var(--sp-10)', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <p className="text-uppercase" style={{ color: 'var(--sn-sand)', marginBottom: 'var(--sp-3)' }}>Communauté</p>
                    <h1 style={{ color: 'white', marginBottom: 'var(--sp-3)' }}>Feed Photo</h1>
                </div>
            </div>
            <div className="container" style={{ paddingTop: 'var(--sp-8)' }}>
                <div className="masonry">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="masonry-item skeleton" style={{ minHeight: 200 + (i % 3) * 80 }} />
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <div style={{ paddingTop: 'var(--header-height)' }}>
            {/* Header */}
            <div style={{
                background: 'var(--sn-black)',
                padding: 'var(--sp-12) 0 var(--sp-10)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div className="container">
                    <p className="text-uppercase" style={{ color: 'var(--sn-sand)', marginBottom: 'var(--sp-3)' }}>Communauté</p>
                    <h1 style={{ color: 'white', marginBottom: 'var(--sp-3)' }}>Feed Photo</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>
                        Les dernières photos de la communauté Sunu Nataal
                    </p>
                </div>
            </div>

            <div className="container section" style={{ paddingTop: 'var(--sp-8)' }}>
                {/* Masonry Feed */}
                <div className="masonry">
                    {visibleImages.map((photo, i) => {
                        const isLiked = likedIds.has(photo.id)
                        return (
                            <div key={photo.id} className="masonry-item" onClick={() => setLightbox(photo)} style={{
                                animation: 'fadeInUp 0.5s cubic-bezier(.16,1,.3,1) both',
                                animationDelay: `${(i % batchSize) * 60}ms`
                            }}>
                                <img src={photo.url} alt={photo.title} loading="lazy" />
                                <div className="masonry-overlay" style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div>
                                            <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 2 }}>
                                                {photo.photographer}
                                            </p>
                                            <p style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                                {photo.location || photo.category} · {photo.timestamp}
                                            </p>
                                        </div>
                                        <button onClick={(e) => toggleLike(e, photo.id)} style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '1.3rem',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--sp-1)',
                                            padding: 'var(--sp-2)',
                                            transition: 'transform 0.2s ease'
                                        }}>
                                            <span style={{
                                                color: isLiked ? '#ff4757' : 'white',
                                                transform: isLiked ? 'scale(1.2)' : 'scale(1)',
                                                transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
                                                display: 'inline-block'
                                            }}>
                                                {isLiked ? '❤️' : '🤍'}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-accent)', fontWeight: 500 }}>
                                                {(photo.likes || 0) + (isLiked ? 1 : 0)}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Loading More Skeleton */}
                {loadingMore && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'var(--sp-4)',
                        marginTop: 'var(--sp-4)'
                    }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton" style={{ height: 200 + Math.random() * 100, borderRadius: 'var(--radius-md)' }} />
                        ))}
                    </div>
                )}

                {/* End of feed */}
                {visible >= feedImages.length && !initialLoading && (
                    <div style={{ textAlign: 'center', padding: 'var(--sp-12) 0', color: 'var(--sn-gray-light)' }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: 'var(--sp-2)' }}>📷</p>
                        <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.9rem' }}>Vous avez tout vu ! Revenez bientôt.</p>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div className="lightbox-backdrop" onClick={() => setLightbox(null)}>
                    <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
                    <img src={lightbox.url} alt="" className="lightbox-image" onClick={e => e.stopPropagation()} />
                    <div className="lightbox-info">
                        <h4>{lightbox.title}</h4>
                        <p>par {lightbox.photographer} · {lightbox.timestamp}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
