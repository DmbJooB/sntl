import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getWalkBySlug, getUserById } from '../services/db'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import { Share2, Download } from 'lucide-react'
import { downloadWithWatermark } from '../utils/watermark'

// Fix default icon issue with react-leaflet
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

export default function WalkDetailPage() {
    const { slug } = useParams()
    const [walk, setWalk] = useState(null)
    const [photographer, setPhotographer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lightbox, setLightbox] = useState(null)
    const detailsRef = useRef(null)

    useEffect(() => {
        const fetchData = async () => {
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
                console.error("Error fetching walk details:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [slug])

    if (loading) return <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', textAlign: 'center' }}>Chargement...</div>
    if (!walk) return <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', textAlign: 'center' }}>Randonnée non trouvée.</div>

    const handleShareLocation = () => {
        if (!walk.coordinates) return
        const [lat, lng] = walk.coordinates
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

        if (navigator.share) {
            navigator.share({
                title: `Lieu de rendez-vous: ${walk.location}`,
                url: mapUrl
            }).catch(console.error)
        } else {
            navigator.clipboard.writeText(mapUrl).then(() => {
                alert("Lien de la carte copié dans le presse-papier !")
            })
        }
    }


    return (
        <div style={{ paddingTop: 'var(--header-height)' }}>
            {/* Hero */}
            <div style={{
                position: 'relative',
                height: '60vh',
                minHeight: '450px',
                overflow: 'hidden'
            }}>
                <img src={walk.cover} alt={walk.title} style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    filter: 'brightness(0.7)'
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                    display: 'flex', alignItems: 'flex-end', paddingBottom: 'var(--sp-12)'
                }}>
                    <div className="container" style={{ color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
                        <Link to="/randonnees" style={{
                            fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)',
                            marginBottom: 'var(--sp-4)', display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)',
                            textDecoration: 'none', fontWeight: 500
                        }}>
                            ← Toutes les randonnées
                        </Link>
                        <div style={{ marginBottom: 'var(--sp-4)' }}>
                            <span className={`badge ${walk.status === 'upcoming' ? 'badge-walk' : ''}`} style={{
                                background: walk.status === 'past' ? 'rgba(255,255,255,0.15)' : 'var(--sn-flag-green)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '6px 16px',
                                fontSize: '0.85rem',
                                letterSpacing: '0.05em'
                            }}>
                                {walk.status === 'upcoming' ? '📸 Inscriptions Ouvertes' : '✓ Terminée'}
                            </span>
                        </div>
                        <h1 style={{
                            color: 'white', marginBottom: 'var(--sp-4)',
                            fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1
                        }}>
                            {walk.title}
                        </h1>
                        <p style={{
                            color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem',
                            display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', flexWrap: 'wrap'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                                📅 {new Date(walk.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                                📍 {walk.location}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="container section" style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Main Description */}
                <div style={{ marginBottom: 'var(--sp-10)' }}>
                    <h3 style={{ marginBottom: 'var(--sp-6)', fontSize: '1.5rem', borderBottom: '2px solid var(--sn-sand-pale)', paddingBottom: 'var(--sp-3)', display: 'inline-block' }}>
                        À propos de cette randonnée
                    </h3>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                        {walk.description}
                    </p>
                </div>

                {/* Practical Details Card */}
                <div className="card" ref={detailsRef} style={{ padding: 'var(--sp-8)', borderTop: '4px solid var(--sn-sand)', marginBottom: 'var(--sp-8)' }}>
                    <h4 style={{ marginBottom: 'var(--sp-6)', fontSize: '1.2rem' }}>Détails pratiques</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-6) var(--sp-8)' }}>
                        {[
                            ['📅 Date', new Date(walk.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })],
                            ['🕐 Heure', walk.time],
                            ['📍 Lieu', walk.location],
                            ['👥 Participants', `${walk.participants} / ${walk.maxParticipants}`]
                        ].map(([label, value]) => (
                            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                                <span style={{ color: 'var(--sn-gray)', fontSize: '0.9rem' }}>{label}</span>
                                <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                    {walk.status === 'upcoming' && (
                        <div style={{ marginTop: 'var(--sp-8)', textAlign: 'center' }}>
                            <button
                                className="btn btn-primary"
                                style={{ padding: 'var(--sp-4) var(--sp-8)', fontSize: '1.05rem' }}
                                onClick={() => detailsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                S'inscrire à la randonnée
                            </button>
                        </div>
                    )}
                </div>

                {/* Map & Photographer Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--sp-6)', marginBottom: 'var(--sp-12)' }}>
                    {/* Map */}
                    <div className="card" style={{ padding: 'var(--sp-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
                            <h4 style={{ margin: 0 }}>📍 Lieu de rendez-vous</h4>
                            <button onClick={handleShareLocation} style={{ background: 'none', border: 'none', color: 'var(--sn-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 500 }} title="Partager la position">
                                <Share2 size={16} /> Partager
                            </button>
                        </div>
                        {walk.coordinates ? (
                            <div className="map-container" style={{ height: 300, background: '#eee', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                                <MapContainer center={walk.coordinates} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={walk.coordinates}>
                                        <Popup>{walk.location}</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        ) : (
                            <div style={{ height: 300, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)' }}>
                                <p style={{ color: 'var(--sn-gray)' }}>Coordonnées non disponibles</p>
                            </div>
                        )}
                    </div>

                    {/* Photographer */}
                    {photographer && (
                        <Link to={`/photographes/${photographer.slug}`} className="card" style={{ padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--sp-4)', textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                                <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
                                    <img src={photographer.avatar} alt={photographer.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                                    {photographer.isMember && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0, right: 0,
                                            background: 'var(--sn-black)',
                                            borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '2px solid white',
                                            padding: '2px',
                                            zIndex: 2
                                        }} title="Membre Sunu Nataal">
                                            <img src="/images/logo_sntl.png" alt="SNTL Member" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-uppercase text-small" style={{ color: 'var(--sn-sand)', marginBottom: 'var(--sp-1)' }}>Guide photo</p>
                                    <h4 style={{ fontSize: '1.2rem', marginBottom: 'var(--sp-1)' }}>{photographer.name}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--sn-gray-light)' }}>{photographer.speciality}</p>
                                </div>
                            </div>
                            <div style={{ marginTop: 'var(--sp-2)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--sn-border)' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--sn-primary)', fontWeight: 500 }}>Voir le profil →</span>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Gallery */}
                {walk.photos?.length > 0 && (
                    <div>
                        <div className="section-header" style={{ marginBottom: 'var(--sp-8)', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.8rem' }}>Galerie photo</h3>
                            <p style={{ color: 'var(--sn-gray)', marginTop: 'var(--sp-2)' }}>Quelques clichés de cette balade</p>
                        </div>
                        <div className="masonry">
                            {walk.photos.map(photo => (
                                <div key={photo.id} className="masonry-item" onClick={() => setLightbox(photo)}>
                                    <img src={photo.url} alt={`Photo by ${photo.photographer}`} loading="lazy" />
                                    <div className="masonry-overlay" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div>
                                            <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.85rem', fontWeight: 600 }}>{photo.photographer}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                                            <button
                                                className="icon-btn-light"
                                                onClick={() => {
                                                    const url = photo.url
                                                    if (navigator.share) {
                                                        navigator.share({ title: `Photo par ${photo.photographer}`, url })
                                                    } else {
                                                        navigator.clipboard.writeText(url).then(() => alert('Lien copié !'))
                                                    }
                                                }}
                                                title="Partager"
                                            >
                                                <Share2 size={14} />
                                            </button>
                                            <button
                                                className="icon-btn-light"
                                                onClick={() => downloadWithWatermark(photo.url, `sunu-nataal-${photo.id || 'photo'}.jpg`)}
                                                title="Télécharger"
                                            >
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
