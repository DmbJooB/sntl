import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import WalksPage from './pages/WalksPage'
import WalkDetailPage from './pages/WalkDetailPage'
import PhotographersListPage from './pages/PhotographersListPage'
import PhotographerPage from './pages/PhotographerPage'
import ImageBankPage from './pages/ImageBankPage'
import ImageDetailPage from './pages/ImageDetailPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import WalkGalleryPage from './pages/WalkGalleryPage'
import CartPage from './pages/CartPage'
import FeedPage from './pages/FeedPage'
import UserDashboard from './pages/dashboard/UserDashboard'
import ContributorDashboard from './pages/dashboard/ContributorDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import LoginPage from './pages/LoginPage'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import ErrorBoundary from './components/layout/ErrorBoundary'

export default function App() {
    const { pathname } = useLocation()

    React.useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return (
        <CartProvider>
            <AuthProvider>
                <Header />
                <main>
                    <ErrorBoundary>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/randonnees" element={<WalksPage />} />
                            <Route path="/randonnees/:slug" element={<WalkDetailPage />} />
                            <Route path="/photographes" element={<PhotographersListPage />} />
                            <Route path="/photographes/:slug" element={<PhotographerPage />} />
                            <Route path="/banque-images" element={<ImageBankPage />} />
                            <Route path="/banque-images/:id" element={<ImageDetailPage />} />
                            <Route path="/evenements" element={<EventsPage />} />
                            <Route path="/evenements/:slug" element={<EventDetailPage />} />
                            <Route path="/randonnees/:slug/gallery" element={<WalkGalleryPage />} />
                            <Route path="/feed" element={<FeedPage />} />
                            <Route path="/panier" element={<CartPage />} />
                            <Route path="/login" element={<LoginPage />} />

                            {/* Dashboards */}
                            <Route path="/dashboard/user" element={
                                <ProtectedRoute allowedRoles={['Utilisateur', 'Membre', 'Contributeur', 'Administrateur']}>
                                    <UserDashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/dashboard/contributor" element={
                                <ProtectedRoute allowedRoles={['Membre', 'Contributeur', 'Administrateur']}>
                                    <UserDashboard /> {/* Fallback to UserDashboard if not implemented */}
                                </ProtectedRoute>
                            } />
                            <Route path="/dashboard/admin" element={
                                <ProtectedRoute allowedRoles={['Administrateur']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </ErrorBoundary>
                </main>
                <Footer />
            </AuthProvider>
        </CartProvider>
    )
}
