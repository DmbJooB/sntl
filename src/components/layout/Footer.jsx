import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer style={{
            background: 'var(--sn-black)',
            color: 'rgba(255,255,255,0.7)',
            padding: 'var(--sp-16) 0 var(--sp-8)'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 'var(--sp-10)',
                    marginBottom: 'var(--sp-12)'
                }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
                            <img src="/images/logo_sntl.png" alt="Sunu Nataal" style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }} />
                            <h3 style={{
                                fontFamily: 'var(--font-heading)',
                                color: 'white',
                                fontSize: '1.5rem',
                                marginBottom: 0
                            }}>
                                Sunu Nataal
                            </h3>
                        </div>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)' }}>
                            Collectif de photographes sénégalais.<br />
                            Randonnées photo · Expositions · Workshops<br />
                            Banque d'images du Sénégal.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-5)' }}>
                            {['Instagram', 'Facebook', 'YouTube'].map(s => (
                                <a key={s} href="#" style={{
                                    width: 40, height: 40,
                                    borderRadius: 'var(--radius-full)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'rgba(255,255,255,0.6)',
                                    fontSize: '0.7rem',
                                    fontFamily: 'var(--font-accent)',
                                    transition: 'all 0.3s ease',
                                    textDecoration: 'none'
                                }}>
                                    {s[0] + s[1]}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 style={{ color: 'white', fontFamily: 'var(--font-accent)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--sp-5)', fontWeight: 600 }}>
                            Navigation
                        </h4>
                        {[
                            { to: '/randonnees', label: 'Randonnées Photo' },
                            { to: '/photographes', label: 'Nos Photographes' },
                            { to: '/banque-images', label: 'Banque d\'Images' },
                            { to: '/evenements', label: 'Événements' },
                            { to: '/feed', label: 'Feed Photo' }
                        ].map(link => (
                            <Link key={link.to} to={link.to} style={{
                                display: 'block',
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '0.9rem',
                                marginBottom: 'var(--sp-3)',
                                transition: 'color 0.2s ease'
                            }}>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ color: 'white', fontFamily: 'var(--font-accent)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--sp-5)', fontWeight: 600 }}>
                            Contact
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: 'var(--sp-2)' }}>
                            contact@sununataal.com
                        </p>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: 'var(--sp-2)' }}>
                            Dakar, Sénégal
                        </p>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                            +221 77 000 00 00
                        </p>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 style={{ color: 'white', fontFamily: 'var(--font-accent)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--sp-5)', fontWeight: 600 }}>
                            Newsletter
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 'var(--sp-4)' }}>
                            Recevez les prochaines randonnées et expositions.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                style={{
                                    flex: 1,
                                    padding: 'var(--sp-3) var(--sp-4)',
                                    borderRadius: 'var(--radius-full)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '0.85rem',
                                    fontFamily: 'var(--font-body)',
                                    outline: 'none'
                                }}
                            />
                            <button className="btn btn-primary" style={{ padding: 'var(--sp-3) var(--sp-5)', fontSize: '0.8rem' }}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: 'var(--sp-6)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'var(--sp-4)'
                }}>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                        © 2026 Sunu Nataal. Tous droits réservés.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--sp-5)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>Mentions légales</span>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>Confidentialité</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
