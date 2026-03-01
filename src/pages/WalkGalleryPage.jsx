import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getWalkBySlug, getUserById } from '../services/db'
import WatermarkOverlay from '../components/WatermarkOverlay'
import { Download, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react'


function handleShare(photo, walk) {
    const url = window.location.href
    if (navigator.share) {
        navigator.share({ title: `Photo - ${walk.title}`, text: `Découvrez cette photo de la randonnée "${walk.title}"`, url })
    } else {
        navigator.clipboard.writeText(url).then(() => alert('Lien copié dans le presse-papier !'))
    }
}

import { downloadWithWatermark } from '../utils/watermark';

async function handleDownload(photo, walk) {
    await downloadWithWatermark(photo.url, `sunu-nataal-${walk.slug}-photo.jpg`);
}

export default function WalkGalleryPage() {
    const { slug } = useParams()
    const [walk, setWalk] = useState(null)
    const [photographer, setPhotographer] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const fetchedWalk = await getWalkBySlug(slug)
                if (fetchedWalk) {
                    setWalk(fetchedWalk)
                    if (fetchedWalk.photographerId) {
                        const fetchedPhotographer = await getUserById(fetchedWalk.photographerId.toString())
                        setPhotographer(fetchedPhotographer)
                    }
                }
            } catch (error) {
                console.error("Error fetching gallery:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchGallery()
    }, [slug])

    const photos = walk?.photos || []

    const prev = useCallback(() => setSelectedIndex(i => (i > 0 ? i - 1 : photos.length - 1)), [photos.length])
    const next = useCallback(() => setSelectedIndex(i => (i < photos.length - 1 ? i + 1 : 0)), [photos.length])

    useEffect(() => {
        const onKey = (e) => {
            if (selectedIndex === null) return
            if (e.key === 'ArrowLeft') prev()
            if (e.key === 'ArrowRight') next()
            if (e.key === 'Escape') setSelectedIndex(null)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [selectedIndex, prev, next])

    if (loading) return <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', background: 'var(--sn-black)', color: 'white', minHeight: '100vh', textAlign: 'center' }}>Chargement...</div>
    if (!walk) return <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', background: 'var(--sn-black)', color: 'white', minHeight: '100vh', textAlign: 'center' }}>Randonnée non trouvée</div>

    const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null

    return (
        <div style={{ paddingTop: 'var(--header-height)', minHeight: '100vh', background: 'var(--sn-black)', color: 'white' }}>

            {/* Hero / Header */}
            <div style={{
                padding: 'var(--sp-12) 0 var(--sp-8)',
                textAlign: 'center',
                background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${walk.cover}) center/cover fixed`
            }}>
                <div className="container">
                    <Link to="/randonnees" style={{
                        color: 'var(--sn-sand)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-6)', fontSize: '0.9rem'
                    }}>
                        ← Retour à la galerie
                    </Link>
                    <h1 style={{ fontSize: '3rem', marginBottom: 'var(--sp-4)' }}>{walk.title}</h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-6)', color: 'rgba(255,255,255,0.8)' }}>
                        <span>📅 {new Date(walk.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>📍 {walk.location}</span>
                        {photographer && <span>📷 {photographer.name}</span>}
                        <span>🖼️ {photos.length} photos</span>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="container section">
                {photos.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 'var(--sp-4)'
                    }}>
                        {photos.map((photo, index) => (
                            <div
                                key={photo.id || index}
                                onClick={() => setSelectedIndex(index)}
                                style={{
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    aspectRatio: '3/2',
                                    borderRadius: 'var(--radius-md)',
                                    position: 'relative',
                                    animation: 'fadeInUp 0.5s cubic-bezier(.16,1,.3,1) both',
                                    animationDelay: `${index * 50}ms`
                                }}
                                className="gallery-thumb"
                            >
                                <img src={photo.url} alt={`Photo de ${walk.title}`} style={{
                                    width: '100%', height: '100%', objectFit: 'cover',
                                    transition: 'transform 0.3s ease'
                                }} />
                                {/* Watermark less intrusive on walks */}
                                <WatermarkOverlay opacity={0.3} />
                                {/* Hover overlay with actions */}
                                <div className="gallery-thumb-overlay" style={{
                                    position: 'absolute', inset: 0, zIndex: 3,
                                    background: 'rgba(0,0,0,0.3)',
                                    display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
                                    padding: 'var(--sp-3)',
                                    opacity: 0, transition: 'opacity 0.2s'
                                }}>
                                    <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 500 }}>
                                        Cliquer pour agrandir
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 'var(--sp-12)', color: 'var(--sn-gray)' }}>
                        <p>Aucune photo disponible pour cette randonnée pour le moment.</p>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.97)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }} onClick={() => setSelectedIndex(null)}>

                    {/* Top bar */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: 'var(--sp-4) var(--sp-6)',
                        background: 'linear-gradient(rgba(0,0,0,0.7), transparent)',
                        zIndex: 2
                    }} onClick={e => e.stopPropagation()}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                            {selectedIndex + 1} / {photos.length} — {walk.title}
                        </span>
                        <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleShare(selectedPhoto, walk) }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer', fontSize: '0.9rem'
                                }}
                            >
                                <Share2 size={16} /> Partager
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDownload(selectedPhoto, walk) }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'var(--sn-sand)', border: 'none',
                                    color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600
                                }}
                            >
                                <Download size={16} /> Télécharger
                            </button>
                            <button
                                onClick={() => setSelectedIndex(null)}
                                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', padding: '4px 8px' }}
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Nav: Previous */}
                    {photos.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); prev() }} style={{
                            position: 'absolute', left: 'var(--sp-4)', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', padding: '12px', borderRadius: '50%', cursor: 'pointer', zIndex: 3
                        }}>
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {/* Image with watermark */}
                    <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
                        <img
                            src={selectedPhoto.url}
                            alt="Agrandissement"
                            style={{
                                maxWidth: '90vw', maxHeight: '80vh',
                                boxShadow: '0 0 80px rgba(0,0,0,0.5)',
                                borderRadius: 'var(--radius-sm)',
                                display: 'block'
                            }}
                        />
                        <WatermarkOverlay opacity={0.3} />
                    </div>

                    {/* Nav: Next */}
                    {photos.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); next() }} style={{
                            position: 'absolute', right: 'var(--sp-4)', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', padding: '12px', borderRadius: '50%', cursor: 'pointer', zIndex: 3
                        }}>
                            <ChevronRight size={24} />
                        </button>
                    )}

                    {/* Bottom caption */}
                    {(selectedPhoto.photographer || photographer?.name) && (
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            padding: 'var(--sp-4) var(--sp-6)',
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                            color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', textAlign: 'center',
                            zIndex: 2
                        }}>
                            © {selectedPhoto.photographer || photographer?.name} — {walk.title}
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .gallery-thumb:hover img { transform: scale(1.05); }
                .gallery-thumb:hover .gallery-thumb-overlay { opacity: 1 !important; }
            `}</style>
        </div>
    )
}


