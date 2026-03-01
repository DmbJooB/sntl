import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUsers } from '../services/db'

export default function PhotographersListPage() {
    const [photographers, setPhotographers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPhotographers = async () => {
            try {
                const data = await getUsers()
                // You can filter by role here if needed, or assume all are photographers
                setPhotographers(data)
            } catch (error) {
                console.error("Error fetching photographers:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPhotographers()
    }, [])

    if (loading) return <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', textAlign: 'center' }}>Chargement...</div>

    return (
        <div style={{ paddingTop: 'var(--header-height)' }}>
            <div style={{
                background: 'var(--sn-black)',
                padding: 'var(--sp-16) 0 var(--sp-12)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div className="container">
                    <p className="text-uppercase" style={{ color: 'var(--sn-sand)', marginBottom: 'var(--sp-3)' }}>Le Collectif</p>
                    <h1 style={{ color: 'white', marginBottom: 'var(--sp-4)' }}>Nos Photographes</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '520px', margin: '0 auto', fontSize: '1.05rem' }}>
                        Découvrez les artistes qui composent le collectif Sunu Nataal. Des regards uniques sur le Sénégal.
                    </p>
                </div>
            </div>

            <div className="container section">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                    gap: 'var(--sp-6)'
                }}>
                    {photographers.map((p, i) => (
                        <Link to={`/photographes/${p.slug}`} key={p.id} className="card" style={{
                            display: 'flex',
                            flexDirection: 'row',
                            overflow: 'hidden',
                            animation: 'fadeInUp 0.6s cubic-bezier(.16,1,.3,1) both',
                            animationDelay: `${i * 100}ms`
                        }}>
                            <div style={{
                                width: 160,
                                minHeight: 200,
                                flexShrink: 0,
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <img src={p.avatar} alt={p.name} style={{
                                    width: '100%', height: '100%', objectFit: 'cover',
                                    transition: 'transform 0.6s ease'
                                }} />
                                {p.isMember && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 'var(--sp-2)', left: 'var(--sp-2)',
                                        background: 'var(--sn-black)',
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '2px solid white',
                                        padding: '2px',
                                        zIndex: 2
                                    }} title="Membre Sunu Nataal">
                                        <img src="/images/logo_sntl.png" alt="SNTL Member" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.3))',
                                    pointerEvents: 'none'
                                }} />
                            </div>
                            <div style={{ flex: 1, padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <span className="badge badge-walk" style={{ marginBottom: 'var(--sp-2)', alignSelf: 'flex-start' }}>
                                    {p.speciality}
                                </span>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: 'var(--sp-2)' }}>{p.name}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--sn-gray-light)', marginBottom: 'var(--sp-3)' }}>
                                    📍 {p.location}
                                </p>
                                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 'var(--sp-4)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {p.bio}
                                </p>
                                <div style={{ display: 'flex', gap: 'var(--sp-6)', fontSize: '0.8rem', color: 'var(--sn-gray-light)' }}>
                                    <span><strong style={{ color: 'var(--sn-black)', fontSize: '1.1rem' }}>{p.photosCount}</strong> photos</span>
                                    <span><strong style={{ color: 'var(--sn-black)', fontSize: '1.1rem' }}>{p.walksCount}</strong> randonnées</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
