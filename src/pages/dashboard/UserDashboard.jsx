import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Image as ImageIcon, Heart, ShoppingBag, User } from 'lucide-react'
import ImageCard from '../../components/image-bank/ImageCard'
import { useAuth } from '../../contexts/AuthContext'
import { getBankImages } from '../../services/db'

export default function UserDashboard() {
    const { currentUser } = useAuth()
    const [activeTab, setActiveTab] = useState('orders')
    const [favoriteImages, setFavoriteImages] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        getBankImages()
            .then(imgs => {
                if (isMounted) {
                    setFavoriteImages(imgs.slice(0, 3));
                    setError(null);
                }
            })
            .catch(err => {
                console.error("UserDashboard fetch error:", err);
                if (isMounted) setError("Impossible de charger vos favoris. Veuillez vérifier votre connexion.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [])

    const navItemStyle = (tabId) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-3)',
        padding: '10px 12px',
        background: activeTab === tabId ? '#f5f5f5' : 'transparent',
        borderRadius: 'var(--radius-sm)',
        fontWeight: activeTab === tabId ? 600 : 400,
        color: activeTab === tabId ? 'var(--sn-black)' : 'var(--sn-gray)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: 'none',
        outline: 'none',
        width: '100%',
        textAlign: 'left'
    })

    return (
        <div style={{ paddingTop: 'calc(var(--header-height) + var(--sp-8))', minHeight: '100vh', background: '#f9f9f9', paddingBottom: 'var(--sp-12)' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-8)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={32} color="#999" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Mon Espace</h1>
                            <p style={{ color: 'var(--sn-gray)', margin: 0 }}>{currentUser?.email || 'bienvenue@exemple.com'}</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 'var(--sp-8)' }}>
                    {/* Sidebar */}
                    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-5)', border: '1px solid var(--sn-border)', height: 'fit-content' }}>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
                            <button onClick={() => setActiveTab('orders')} style={navItemStyle('orders')}>
                                <ShoppingBag size={18} /> Mes Commandes
                            </button>
                            <button onClick={() => setActiveTab('favorites')} style={navItemStyle('favorites')}>
                                <Heart size={18} /> Favoris
                            </button>
                            <button onClick={() => setActiveTab('downloads')} style={navItemStyle('downloads')}>
                                <ImageIcon size={18} /> Téléchargements
                            </button>
                            <div style={{ height: '1px', background: 'var(--sn-border)', margin: 'var(--sp-2) 0' }} />
                            <button onClick={() => setActiveTab('settings')} style={navItemStyle('settings')}>
                                <Settings size={18} /> Paramètres Profil
                            </button>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

                        {activeTab === 'orders' && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)' }}>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--sp-4)' }}>Commandes d'impression récentes</h2>
                                <p style={{ color: 'var(--sn-gray)' }}>Vous n'avez pas encore passé de commande d'impression.</p>
                                <Link to="/banque-images" className="btn-primary" style={{ display: 'inline-flex', marginTop: 'var(--sp-4)', textDecoration: 'none' }}>Découvrir la galerie</Link>
                            </div>
                        )}

                        {activeTab === 'favorites' && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)' }}>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--sp-4)' }}>Mes Images Favorites</h2>
                                {loading ? (
                                    <p style={{ color: 'var(--sn-gray)' }}>Chargement...</p>
                                ) : error ? (
                                    <div style={{ padding: 'var(--sp-4)', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 'var(--radius-sm)', color: '#cf1322' }}>
                                        {error}
                                    </div>
                                ) : favoriteImages.length > 0 ? (
                                    <div className="masonry" style={{ columns: '3 200px' }}>
                                        {favoriteImages.map(img => (
                                            <div key={img.id} className="masonry-item">
                                                <ImageCard image={img} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--sn-gray)' }}>Aucun favori pour le moment.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'downloads' && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)' }}>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--sp-4)' }}>Derniers téléchargements numériques</h2>
                                <p style={{ color: 'var(--sn-gray)' }}>Aucun téléchargement récent.</p>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)' }}>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--sp-4)' }}>Paramètres du Profil</h2>
                                <form onSubmit={(e) => { e.preventDefault(); alert("Profil mis à jour !"); }} style={{ maxWidth: '500px' }}>
                                    <div style={{ marginBottom: 'var(--sp-4)' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Nom complet</label>
                                        <input type="text" defaultValue={currentUser?.displayName || "Utilisateur"} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '1rem' }} />
                                    </div>
                                    <div style={{ marginBottom: 'var(--sp-4)' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Adresse Email</label>
                                        <input type="email" defaultValue={currentUser?.email || "email@exemple.com"} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '1rem' }} disabled />
                                    </div>
                                    <div style={{ marginBottom: 'var(--sp-6)' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Mot de passe</label>
                                        <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '1rem' }} />
                                    </div>
                                    <button type="submit" className="btn-primary">Enregistrer les modifications</button>
                                </form>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}
