import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUserBySlug, getImagesByPhotographer, getWalks } from '../services/db'

export default function PhotographerPage() {
    const { slug } = useParams()
    const [p, setP] = useState(null)
    const [pWalks, setPWalks] = useState([])
    const [pImages, setPImages] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('gallery')
    const [lightbox, setLightbox] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const photographer = await getUserBySlug(slug)
                if (photographer) {
                    setP(photographer)
                    const userImages = await getImagesByPhotographer(photographer.id)
                    const allWalks = await getWalks()
                    const userWalks = allWalks.filter(w =>
                        w.photographerId === photographer.id ||
                        w.photographerId?.toString() === photographer.id.toString()
                    )

                    setPImages(userImages)
                    setPWalks(userWalks)
                }
            } catch (error) {
                console.error("Error fetching photographer details:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [slug])

    if (loading) return <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', textAlign: 'center' }}>Chargement...</div>
    if (!p) return <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', textAlign: 'center' }}>Photographe non trouvé.</div>

    // Combine all images from walks and bank for gallery
    const allPhotos = [
        ...pImages.map(i => ({ id: i.id, url: i.url, title: i.title })),
        ...pWalks.flatMap(w => (w.photos || []).filter(ph => ph.photographer === p.name))
    ]

    return (
        <div style={{ paddingTop: 'var(--header-height)' }}>
            {/* Cover */}
            <div style={{ position: 'relative', height: '320px', overflow: 'hidden' }}>
                <img src={p.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }} />
            </div>

            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                {/* Profile Header */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--sp-6)',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    marginBottom: 'var(--sp-8)'
                }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={p.avatar} alt={p.name} style={{
                            width: 140, height: 140,
                            borderRadius: 'var(--radius-lg)',
                            objectFit: 'cover',
                            border: '4px solid var(--sn-white)',
                            boxShadow: 'var(--shadow-lg)',
                            marginTop: '-10px' // Pull avatar up over cover
                        }} />
                        {p.isMember && (
                            <div style={{
                                position: 'absolute',
                                bottom: -5, right: -5,
                                background: 'var(--sn-black)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '3px solid white',
                                padding: '4px',
                                zIndex: 10
                            }} title="Membre Sunu Nataal">
                                <img src="/images/logo_sntl.png" alt="SNTL Member" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                            </div>
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 250, paddingBottom: 'var(--sp-2)' }}>

                        <h1 style={{ marginBottom: 'var(--sp-2)', fontSize: '2.2rem' }}>{p.name}</h1>
                        <span className="badge badge-walk" style={{ marginBottom: 'var(--sp-2)' }}>{p.speciality}</span>
                        <p style={{ fontSize: '0.95rem', color: 'var(--sn-gray)' }}>📍 {p.location}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--sp-8)', textAlign: 'center' }}>
                        {[
                            [p.photosCount, 'Photos'],
                            [p.walksCount, 'Randonnées'],
                            [allPhotos.length, 'Galerie']
                        ].map(([num, label]) => (
                            <div key={label}>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--sn-black)' }}>{num}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--sn-gray-light)', fontFamily: 'var(--font-accent)' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bio & Social */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 300px',
                    gap: 'var(--sp-8)',
                    marginBottom: 'var(--sp-10)'
                }}>
                    <div>
                        <h3 style={{ marginBottom: 'var(--sp-3)' }}>Biographie</h3>
                        <p style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>{p.bio}</p>
                    </div>
                    <div className="card" style={{ padding: 'var(--sp-5)', height: 'fit-content' }}>
                        <h4 style={{ marginBottom: 'var(--sp-4)' }}>Liens</h4>
                        {p.social?.instagram && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
                                <span style={{ fontSize: '1.2rem' }}>📸</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--sn-sand)', fontWeight: 500 }}>{p.social.instagram}</span>
                            </div>
                        )}
                        {p.social?.website && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                                <span style={{ fontSize: '1.2rem' }}>🌐</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--sn-sand)', fontWeight: 500 }}>{p.social.website}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ borderBottom: '1px solid var(--sn-border)', marginBottom: 'var(--sp-8)' }}>
                    <div style={{ display: 'flex', gap: 'var(--sp-6)' }}>
                        {[['gallery', 'Galerie'], ['walks', 'Randonnées']].map(([key, label]) => (
                            <button key={key} onClick={() => setTab(key)} style={{
                                padding: 'var(--sp-4) 0',
                                fontFamily: 'var(--font-accent)',
                                fontSize: '0.95rem',
                                fontWeight: tab === key ? 700 : 500,
                                color: tab === key ? 'var(--sn-black)' : 'var(--sn-gray-light)',
                                borderBottom: tab === key ? '2px solid var(--sn-sand)' : '2px solid transparent',
                                transition: 'all 0.2s ease',
                                background: 'none',
                                cursor: 'pointer',
                                border: 'none',
                                borderBottomWidth: 2,
                                borderBottomStyle: 'solid',
                                borderBottomColor: tab === key ? 'var(--sn-sand)' : 'transparent'
                            }}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {tab === 'gallery' && (
                    <div className="masonry" style={{ marginBottom: 'var(--sp-16)' }}>
                        {allPhotos.length > 0 ? allPhotos.map(photo => (
                            <div key={photo.id || photo.url} className="masonry-item" onClick={() => setLightbox(photo)}>
                                <img src={photo.url} alt={photo.title || ''} loading="lazy" />
                                <div className="masonry-overlay">
                                    <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.85rem', fontWeight: 600 }}>{photo.title || ''}</p>
                                </div>
                            </div>
                        )) : (
                            <p style={{ fontSize: '1rem', color: 'var(--sn-gray-light)', padding: 'var(--sp-10) 0' }}>
                                Aucune photo pour le moment.
                            </p>
                        )}
                    </div>
                )}

                {tab === 'walks' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--sp-6)', marginBottom: 'var(--sp-16)' }}>
                        {pWalks.map(walk => (
                            <Link to={`/randonnees/${walk.slug}`} key={walk.id} className="card">
                                <div style={{ overflow: 'hidden' }}>
                                    <img src={walk.cover} alt={walk.title} className="card-image" />
                                </div>
                                <div className="card-body">
                                    <p className="text-accent text-small" style={{ color: 'var(--sn-sand)', marginBottom: 'var(--sp-2)', fontWeight: 600 }}>
                                        {new Date(walk.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <h4>{walk.title}</h4>
                                    <p style={{ fontSize: '0.85rem', marginTop: 'var(--sp-1)' }}>📍 {walk.location}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div className="lightbox-backdrop" onClick={() => setLightbox(null)}>
                    <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
                    <img src={lightbox.url} alt="" className="lightbox-image" onClick={e => e.stopPropagation()} />
                    <div className="lightbox-info">
                        <h4>{lightbox.title || 'Photo'}</h4>
                        <p>par {p.name}</p>
                    </div>
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    )
}
