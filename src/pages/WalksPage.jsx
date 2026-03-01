import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getWalks } from '../services/db'

export default function WalksPage() {
    const [pastWalks, setPastWalks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchWalks = async () => {
            try {
                const allWalks = await getWalks()
                setPastWalks(allWalks.filter(w => w.status === 'past'))
            } catch (error) {
                console.error("Error fetching walks:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchWalks()
    }, [])

    if (loading) {
        return <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', textAlign: 'center' }}>Chargement des randonnées...</div>
    }

    return (
        <div style={{ paddingTop: 'var(--header-height)' }}>
            {/* Page Header */}
            <div style={{
                background: 'var(--sn-black)',
                padding: 'var(--sp-16) 0 var(--sp-12)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div className="container">
                    <p className="text-uppercase" style={{ color: 'var(--sn-sand)', marginBottom: 'var(--sp-3)' }}>Galerie</p>
                    <h1 style={{ color: 'white', marginBottom: 'var(--sp-4)' }}>Retour en images</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '520px', margin: '0 auto', fontSize: '1.05rem' }}>
                        Revivez les moments forts de nos précédentes randonnées à travers les objectifs de nos photographes.
                    </p>
                </div>
            </div>

            <div className="container section">
                {/* Gallery Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: 'var(--sp-8)'
                }}>
                    {pastWalks.map((walk, i) => {
                        return (
                            <Link to={`/randonnees/${walk.slug}/gallery`} key={walk.id} className="card" style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                animation: 'fadeInUp 0.5s cubic-bezier(.16,1,.3,1) both',
                                animationDelay: `${i * 100}ms`
                            }}>
                                {/* Cover Image */}
                                <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3', borderRadius: 'var(--radius-md)', background: 'var(--sn-gray-light)' }}>
                                    {walk.cover ? (
                                        <img src={walk.cover} alt={walk.title} className="card-image" style={{
                                            width: '100%', height: '100%', objectFit: 'cover',
                                            transition: 'transform 0.5s ease'
                                        }} onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            e.target.parentElement.style.background = 'linear-gradient(45deg, var(--sn-black), var(--sn-gray))';
                                        }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, var(--sn-black), var(--sn-gray))' }} />
                                    )}

                                    {/* Overlay Gradient */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                                        display: 'flex', alignItems: 'flex-end', padding: 'var(--sp-5)',
                                        pointerEvents: 'none'
                                    }}>
                                        <div style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                <div>
                                                    <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: 'var(--sp-1)', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                                        {walk.title}
                                                    </h3>
                                                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>
                                                        {new Date(walk.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} · {walk.location}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Photo Count Badge */}
                                    <div style={{
                                        position: 'absolute', top: 'var(--sp-3)', right: 'var(--sp-3)',
                                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                                        borderRadius: 'var(--radius-full)',
                                        padding: '4px 12px',
                                        color: 'white', fontSize: '0.75rem', fontWeight: 600,
                                        display: 'flex', alignItems: 'center', gap: 'var(--sp-2)'
                                    }}>
                                        <span>📷</span>
                                        <span>{walk.photos?.length || 0} photos</span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
