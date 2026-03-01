import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getWalkBySlug } from '../services/db'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import { Share2 } from 'lucide-react'

// Fix default icon issue with react-leaflet
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

export default function EventDetailPage() {
    const { slug } = useParams()
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await getWalkBySlug(slug)
                if (data) {
                    // map category back to type format used by page
                    setEvent({ ...data, type: data.category || 'walk' })
                }
            } catch (error) {
                console.error("Error fetching event:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchEvent()
    }, [slug])

    const handleShareLocation = () => {
        if (!event.coordinates) return
        const [lat, lng] = event.coordinates
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

        if (navigator.share) {
            navigator.share({
                title: `Lieu de l'événement: ${event.location}`,
                url: mapUrl
            }).catch(console.error)
        } else {
            navigator.clipboard.writeText(mapUrl).then(() => {
                alert("Lien de la carte copié dans le presse-papier !")
            })
        }
    }



    if (loading) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Chargement...</div>
    if (!event) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Événement non trouvé</div>

    return (
        <div style={{ paddingTop: 'var(--header-height)' }}>
            {/* Hero */}
            <div style={{
                position: 'relative',
                height: '50vh',
                minHeight: '400px',
                overflow: 'hidden'
            }}>
                <img src={event.cover} alt={event.title} style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    filter: 'brightness(0.6)'
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                    display: 'flex', alignItems: 'flex-end', paddingBottom: 'var(--sp-12)'
                }}>
                    <div className="container" style={{ color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
                        <Link to="/evenements" style={{
                            fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)',
                            marginBottom: 'var(--sp-4)', display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)',
                            textDecoration: 'none', fontWeight: 500
                        }}>
                            ← Tous les événements
                        </Link>
                        <div style={{ marginBottom: 'var(--sp-4)' }}>
                            <span className="badge" style={{
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '6px 16px',
                                fontSize: '0.85rem',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase'
                            }}>
                                {event.type === 'exhibition' ? '🖼️ Exposition' : '🎓 Workshop'}
                            </span>
                        </div>
                        <h1 style={{
                            color: 'white', marginBottom: 'var(--sp-4)',
                            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', lineHeight: 1.1
                        }}>
                            {event.title}
                        </h1>
                        <p style={{
                            color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem',
                            display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', flexWrap: 'wrap'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                                📅 {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                                📍 {event.location}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="container section" style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Main Content */}
                <div style={{ marginBottom: 'var(--sp-10)' }}>
                    <h3 style={{ marginBottom: 'var(--sp-6)', fontSize: '1.5rem', borderBottom: '2px solid var(--sn-sand-pale)', paddingBottom: 'var(--sp-3)', display: 'inline-block' }}>
                        À propos de l'événement
                    </h3>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                        {event.description}
                    </p>
                </div>

                {/* Practical Details - Full Width Card */}
                <div className="card" style={{ padding: 'var(--sp-8)', borderTop: '4px solid var(--sn-sand)', marginBottom: 'var(--sp-8)' }}>
                    <h4 style={{ marginBottom: 'var(--sp-6)', fontSize: '1.2rem' }}>Détails pratiques</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-6) var(--sp-8)' }}>
                        {[
                            ['📅 Date', new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })],
                            ['🕐 Heure', event.time],
                            ['📍 Lieu', event.location],
                            ...(event.endDate ? [['🏁 Fin', new Date(event.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })]] : [])
                        ].map(([label, value]) => (
                            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                                <span style={{ color: 'var(--sn-gray)', fontSize: '0.9rem' }}>{label}</span>
                                <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 'var(--sp-8)', textAlign: 'center' }}>
                        <button className="btn btn-primary" style={{ padding: 'var(--sp-4) var(--sp-8)', fontSize: '1.05rem' }}>
                            {event.type === 'workshop' ? "S'inscrire au workshop" : "Ajouter à l'agenda"}
                        </button>
                    </div>
                </div>

                {/* Map */}
                <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-12)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
                        <h4 style={{ margin: 0 }}>📍 S'y rendre</h4>
                        <button onClick={handleShareLocation} style={{ background: 'none', border: 'none', color: 'var(--sn-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 500 }} title="Partager la position">
                            <Share2 size={16} /> Partager
                        </button>
                    </div>
                    {event.coordinates ? (
                        <div className="map-container" style={{ height: 350, background: '#eee', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                            <MapContainer center={event.coordinates} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={event.coordinates}>
                                    <Popup>{event.location}</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    ) : (
                        <div style={{ height: 350, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)' }}>
                            <p style={{ color: 'var(--sn-gray)' }}>Coordonnées non disponibles</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
