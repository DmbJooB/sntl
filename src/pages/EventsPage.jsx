import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getWalks } from '../services/db'

const typeLabels = { photowalk: '📸 Randonnée', walk: '📸 Randonnée', exhibition: '🖼️ Exposition', workshop: '🎓 Workshop' }
const typeBadgeClass = { photowalk: 'badge-walk', walk: 'badge-walk', exhibition: 'badge-exhibition', workshop: 'badge-workshop' }

const isWalkType = (type) => type === 'walk' || type === 'photowalk'

export default function EventsPage() {
    const [view, setView] = useState('grid')
    const [typeFilter, setTypeFilter] = useState('all')
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const allEvents = await getWalks()
                // Map the category back to type if needed, or just rely on 'category'
                // For compatibility with the rendering logic:
                const mappedEvents = allEvents.map(e => ({ ...e, type: e.category || 'walk' }))
                setEvents(mappedEvents)
            } catch (error) {
                console.error("Error fetching events:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchEvents()
    }, [])

    const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date))
    const filtered = typeFilter === 'all' ? sorted : sorted.filter(e => {
        if (typeFilter === 'walk') return isWalkType(e.type)
        return e.type === typeFilter
    })

    if (loading) {
        return <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', textAlign: 'center' }}>Chargement des événements...</div>
    }

    // Group by month for calendar view
    const grouped = {}
    filtered.forEach(e => {
        const month = new Date(e.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        if (!grouped[month]) grouped[month] = []
        grouped[month].push(e)
    })

    return (
        <div style={{ paddingTop: 'var(--header-height)' }}>
            <div style={{
                background: 'var(--sn-black)',
                padding: 'var(--sp-16) 0 var(--sp-12)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div className="container">
                    <p className="text-uppercase" style={{ color: 'var(--sn-sand)', marginBottom: 'var(--sp-3)' }}>Agenda</p>
                    <h1 style={{ color: 'white', marginBottom: 'var(--sp-4)' }}>Événements</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '480px', margin: '0 auto', fontSize: '1.05rem' }}>
                        Randonnées photo, expositions et workshops. Rejoignez la communauté Sunu Nataal.
                    </p>
                </div>
            </div>

            <div className="container section">
                {/* Filters */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-4)', marginBottom: 'var(--sp-8)' }}>
                    <div className="filter-bar">
                        {[['all', 'Tous'], ['walk', '📸 Randonnées'], ['exhibition', '🖼️ Expositions'], ['workshop', '🎓 Workshops']].map(([val, label]) => (
                            <button key={val} className={`filter-chip ${typeFilter === val ? 'active' : ''}`} onClick={() => setTypeFilter(val)}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                        <button className={`btn btn-icon ${view === 'grid' ? 'btn-dark' : 'btn-secondary'}`} onClick={() => setView('grid')}>▦</button>
                        <button className={`btn btn-icon ${view === 'calendar' ? 'btn-dark' : 'btn-secondary'}`} onClick={() => setView('calendar')}>📅</button>
                    </div>
                </div>

                {view === 'grid' ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: 'var(--sp-6)'
                    }}>
                        {filtered.map((event, i) => (
                            <Link to={isWalkType(event.type) ? `/randonnees/${event.slug}` : `/evenements/${event.slug}`} key={event.id} className="card" style={{
                                animation: 'fadeInUp 0.5s cubic-bezier(.16,1,.3,1) both',
                                animationDelay: `${i * 80}ms`,
                                display: 'block',
                                color: 'inherit'
                            }}>
                                <div style={{ position: 'relative', overflow: 'hidden' }}>
                                    <img src={event.cover} alt={event.title} className="card-image" />
                                    <div style={{ position: 'absolute', top: 'var(--sp-3)', left: 'var(--sp-3)' }}>
                                        <span className={`badge ${typeBadgeClass[event.type]}`}>
                                            {typeLabels[event.type]}
                                        </span>
                                    </div>
                                    {/* Date overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 'var(--sp-3)',
                                        right: 'var(--sp-3)',
                                        background: 'var(--sn-white)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: 'var(--sp-2) var(--sp-3)',
                                        textAlign: 'center',
                                        minWidth: 56,
                                        boxShadow: 'var(--shadow-md)'
                                    }}>
                                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, lineHeight: 1, color: 'var(--sn-black)' }}>
                                            {new Date(event.date).getDate()}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontFamily: 'var(--font-accent)', fontWeight: 700, color: 'var(--sn-sand)', letterSpacing: '0.05em' }}>
                                            {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <p className="text-accent text-small" style={{ color: 'var(--sn-sand)', marginBottom: 'var(--sp-2)', fontWeight: 600 }}>
                                        {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {event.time}
                                    </p>
                                    <h3 style={{ fontSize: '1.15rem', marginBottom: 'var(--sp-2)' }}>{event.title}</h3>
                                    <p style={{ fontSize: '0.85rem', marginBottom: 'var(--sp-3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {event.description}
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--sn-gray-light)' }}>📍 {event.location}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Calendar View */
                    <div>
                        {Object.entries(grouped).map(([month, evts]) => (
                            <div key={month} style={{ marginBottom: 'var(--sp-10)' }}>
                                <h3 style={{ textTransform: 'capitalize', marginBottom: 'var(--sp-5)', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--sn-border)' }}>
                                    {month}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                                    {evts.map(event => (
                                        <Link to={isWalkType(event.type) ? `/randonnees/${event.slug}` : `/evenements/${event.slug}`} key={event.id} className="card" style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            padding: 'var(--sp-4) var(--sp-5)',
                                            gap: 'var(--sp-5)',
                                            color: 'inherit'
                                        }}>
                                            {/* Date */}
                                            <div style={{
                                                textAlign: 'center',
                                                minWidth: 56,
                                                flexShrink: 0
                                            }}>
                                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, lineHeight: 1, color: 'var(--sn-black)' }}>
                                                    {new Date(event.date).getDate()}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontFamily: 'var(--font-accent)', fontWeight: 700, color: 'var(--sn-sand)' }}>
                                                    {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                                </div>
                                            </div>
                                            <div style={{ width: 1, height: 40, background: 'var(--sn-border)' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-1)' }}>
                                                    <span className={`badge ${typeBadgeClass[event.type]}`}>{typeLabels[event.type]}</span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--sn-gray-light)' }}>{event.time}</span>
                                                </div>
                                                <h4>{event.title}</h4>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray-light)', marginTop: 'var(--sp-1)' }}>📍 {event.location}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
