import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('Utilisateur')
    const [isSignup, setIsSignup] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login, signup, currentUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    React.useEffect(() => {
        if (currentUser) {
            const dest = location.state?.from?.pathname || '/dashboard/user'
            navigate(dest, { replace: true })
        }
    }, [currentUser, navigate, location])

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isSignup) {
                await signup(email, password, role)
            } else {
                await login(email, password)
            }
            // Navigation handled by useEffect when currentUser updates
        } catch (err) {
            setError(err.message || "Failed to authenticate")
            setLoading(false)
        }
    }

    const containerStyle = {
        minHeight: 'calc(100vh - var(--header-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--sn-white)',
        padding: '0 var(--sp-6)'
    }

    const formBoxStyle = {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'rgba(250, 250, 250, 0.9)',
        border: '1px solid var(--sn-border)',
        borderRadius: 16,
        padding: 'var(--sp-8)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        marginTop: 'var(--header-height)'
    }

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        marginBottom: 'var(--sp-4)',
        border: '1px solid var(--sn-border)',
        borderRadius: 8,
        fontFamily: 'var(--font-accent)',
        fontSize: '1rem',
        backgroundColor: '#fff'
    }

    const buttonStyle = {
        width: '100%',
        padding: '14px',
        backgroundColor: 'var(--sn-sand)',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        fontFamily: 'var(--font-heading)',
        fontWeight: 600,
        fontSize: '1rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'background 0.2s',
        marginTop: 'var(--sp-2)'
    }

    return (
        <div style={containerStyle}>
            <div style={formBoxStyle}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: 'var(--sp-2)' }}>
                    {isSignup ? "Créer un compte" : "Bon retour !"}
                </h1>
                <p style={{ color: 'var(--sn-gray)', marginBottom: 'var(--sp-6)' }}>
                    {isSignup ? "Rejoignez la communauté Sunu Nataal." : "Connectez-vous pour accéder à votre espace."}
                </p>

                {error && (
                    <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: 'var(--sp-4)', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input
                        style={inputStyle}
                        type="email"
                        placeholder="Adresse email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        style={inputStyle}
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {isSignup && (
                        <select
                            style={inputStyle}
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="Utilisateur">Simple Utilisateur</option>
                            <option value="Contributeur">Contributeur</option>
                        </select>
                    )}
                    <button type="submit" style={buttonStyle} disabled={loading}>
                        {isSignup ? "S'inscrire" : "Se connecter"}
                    </button>
                </form>

                <div style={{ marginTop: 'var(--sp-6)', textAlign: 'center', fontSize: '0.9rem' }}>
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        style={{ background: 'none', border: 'none', color: 'var(--sn-gray)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'var(--font-accent)' }}
                    >
                        {isSignup ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
                    </button>
                </div>
            </div>
        </div>
    )
}
