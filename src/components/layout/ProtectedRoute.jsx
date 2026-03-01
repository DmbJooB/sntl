import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
    const { currentUser, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (allowedRoles && allowedRoles.length > 0) {
        // Here we'd ideally check the user document role. For now, since currentUser comes from AuthContext
        // we added role fetching in AuthContext earlier? Let's check AuthContext.
        const userRole = currentUser.role || 'Utilisateur'
        if (!allowedRoles.includes(userRole)) {
            // Redirect to appropriate dashboard based on role
            if (userRole === 'Administrateur') return <Navigate to="/dashboard/admin" replace />
            if (userRole === 'Contributeur' || userRole === 'Membre') return <Navigate to="/dashboard/contributor" replace />
            return <Navigate to="/dashboard/user" replace />
        }
    }

    return children
}
