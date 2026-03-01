import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { getAppearanceSettings } from '../../services/db'

const defaultNavLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/randonnees', label: 'Randonnées' },
    { path: '/photographes', label: 'Photographes' },
    { path: '/banque-images', label: 'Banque d\'Images' },
    { path: '/evenements', label: 'Événements' },
    { path: '/feed', label: 'Feed' }
]

export default function Header() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [navLinks, setNavLinks] = useState(defaultNavLinks)
    const location = useLocation()
    const { currentUser, logout } = useAuth()
    const { cartItems } = useCart()
    const navigate = useNavigate()
    const isHome = location.pathname === '/'

    // Fetch dynamic menu links
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await getAppearanceSettings()
                if (settings && settings.mainMenuLinks && settings.mainMenuLinks.length > 0) {
                    // Filter out links without required fields, reject blob: URLs, and sort by order
                    const validLinks = settings.mainMenuLinks
                        .filter(link => link.label && link.url && !link.url.startsWith('blob:'))
                        .map(link => ({ path: link.url, label: link.label, order: link.order || 0 }))
                        .sort((a, b) => a.order - b.order)

                    if (validLinks.length > 0) {
                        setNavLinks(validLinks)
                    }
                }
            } catch (error) {
                console.error("Error fetching appearance settings for Header:", error)
                // Default navLinks are already set
            }
        }
        fetchSettings()
    }, [])

    // Dynamic dashboard link based on role
    const getDashboardLink = () => {
        if (!currentUser) return null;
        const role = currentUser.role;
        if (role === 'Administrateur') return { path: '/dashboard/admin', label: 'Administration' };
        if (role === 'Membre' || role === 'Contributeur') return { path: '/dashboard/contributor', label: 'Espace Photographe' };
        return { path: '/dashboard/user', label: 'Mon Profil' };
    }

    const dashboardLink = getDashboardLink();
    const displayLinks = dashboardLink ? [...navLinks, dashboardLink] : navLinks;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        setMenuOpen(false)
    }, [location])

    const headerStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--sp-6)',
        transition: 'all var(--duration-normal) var(--ease-out)',
        background: scrolled ? 'rgba(250,250,250,0.95)' : (isHome ? 'transparent' : 'rgba(250,250,250,0.95)'),
        backdropFilter: scrolled || !isHome ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--sn-border)' : '1px solid transparent',
        color: (!scrolled && isHome) ? 'white' : 'var(--sn-black)'
    }

    const logoStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-3)',
        fontFamily: 'var(--font-heading)',
        fontSize: '1.4rem',
        fontWeight: 800,
        letterSpacing: '-0.02em',
        color: 'inherit',
        textDecoration: 'none'
    }

    const navStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-6)',
        listStyle: 'none'
    }

    const linkStyle = (active) => ({
        fontFamily: 'var(--font-accent)',
        fontSize: '0.88rem',
        fontWeight: active ? 600 : 500,
        color: 'inherit',
        opacity: active ? 1 : 0.8,
        textDecoration: 'none',
        position: 'relative',
        transition: 'opacity var(--duration-fast) ease',
        paddingBottom: '2px',
        borderBottom: active ? '2px solid var(--sn-sand)' : '2px solid transparent'
    })

    const hamburgerStyle = {
        display: 'none',
        flexDirection: 'column',
        gap: '5px',
        cursor: 'pointer',
        padding: '8px',
        zIndex: 110
    }

    const barStyle = (i) => ({
        width: '24px',
        height: '2px',
        background: 'currentColor',
        borderRadius: '2px',
        transition: 'all 0.3s ease',
        transform: menuOpen
            ? i === 0 ? 'rotate(45deg) translate(5px, 5px)' : i === 1 ? 'opacity(0)' : 'rotate(-45deg) translate(5px, -5px)'
            : 'none',
        opacity: menuOpen && i === 1 ? 0 : 1
    })

    const mobileMenuStyle = {
        position: 'fixed',
        inset: 0,
        background: 'var(--sn-white)',
        zIndex: 105,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--sp-8)',
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? 'auto' : 'none',
        transition: 'opacity 0.3s ease'
    }

    const mobileLinkStyle = (active) => ({
        fontFamily: 'var(--font-heading)',
        fontSize: '1.6rem',
        fontWeight: 600,
        color: active ? 'var(--sn-sand)' : 'var(--sn-black)',
        textDecoration: 'none'
    })

    return (
        <>
            <header style={headerStyle}>
                <Link to="/" style={logoStyle}>
                    <img
                        src="/images/logo_sntl.png"
                        alt="Sunu Nataal"
                        style={{
                            width: 44, height: 44,
                            objectFit: 'contain',
                            filter: (!scrolled && isHome) ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' : 'none',
                            transition: 'filter var(--duration-normal) ease'
                        }}
                    />
                    <span>Sunu Nataal</span>
                </Link>

                <nav className="desktop-nav">
                    <ul style={navStyle}>
                        {displayLinks.map(link => (
                            <li key={link.path}>
                                <Link to={link.path} style={linkStyle(location.pathname === link.path)}>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                                {/* Cart Icon */}
                                <Link to="/panier" style={{ position: 'relative', color: 'inherit', opacity: 0.85 }} title="Mon panier">
                                    <ShoppingCart size={20} />
                                    {cartItems.length > 0 && (
                                        <span style={{
                                            position: 'absolute', top: '-6px', right: '-8px',
                                            background: 'var(--sn-sand)', color: 'white',
                                            borderRadius: '50%', width: '16px', height: '16px',
                                            fontSize: '0.65rem', fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>{cartItems.length}</span>
                                    )}
                                </Link>
                                {currentUser ? (
                                    <button onClick={async () => {
                                        await logout();
                                        navigate('/login');
                                    }} style={{ ...linkStyle(false), background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                        Déconnexion
                                    </button>
                                ) : (
                                    <Link to="/login" style={linkStyle(location.pathname === '/login')}>
                                        Connexion
                                    </Link>
                                )}
                            </div>
                        </li>
                    </ul>
                </nav>

                <div className="hamburger" style={hamburgerStyle} onClick={() => setMenuOpen(!menuOpen)}>
                    {[0, 1, 2].map(i => <span key={i} style={barStyle(i)} />)}
                </div>
            </header>

            {/* Mobile Menu */}
            <div style={mobileMenuStyle}>
                {displayLinks.map(link => (
                    <Link key={link.path} to={link.path} style={mobileLinkStyle(location.pathname === link.path)} onClick={() => setMenuOpen(false)}>
                        {link.label}
                    </Link>
                ))}
                {currentUser ? (
                    <button onClick={async () => {
                        await logout();
                        setMenuOpen(false);
                        navigate('/login');
                    }} style={{ ...mobileLinkStyle(false), background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Déconnexion
                    </button>
                ) : (
                    <Link to="/login" style={mobileLinkStyle(location.pathname === '/login')} onClick={() => setMenuOpen(false)}>
                        Connexion
                    </Link>
                )}
            </div>

            <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
        </>
    )
}
