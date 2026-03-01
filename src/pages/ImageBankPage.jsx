import React, { useState, useEffect, useMemo } from 'react'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'
import { getBankImages } from '../services/db'
import FilterSidebar from '../components/image-bank/FilterSidebar'
import ImageCard from '../components/image-bank/ImageCard'

export default function ImageBankPage() {
    const [bankImages, setBankImages] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const data = await getBankImages()
                setBankImages(data)
            } catch (error) {
                console.error("Error fetching images:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchImages()
    }, [])

    const [filters, setFilters] = useState({
        categories: [],
        orientation: 'all',
        price: 'all',
        color: 'all'
    })
    const [searchQuery, setSearchQuery] = useState('')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)



    // Filter Logic
    const filteredImages = useMemo(() => {
        return bankImages.filter(img => {
            // Search
            if (searchQuery && !img.title.toLowerCase().includes(searchQuery.toLowerCase()) && !img.category.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false
            }
            // Categories
            if (filters.categories.length > 0 && !filters.categories.includes(img.category)) {
                return false
            }
            // Orientation
            if (filters.orientation !== 'all') {
                const imgOri = img.orientation === 'landscape' ? 'landscape' : 'portrait'
                // Simplification for demo: assuming data has 'orientation' property matching filter or derived
                if (img.orientation !== filters.orientation) return false
            }
            // Price
            if (filters.price !== 'all') {
                if (filters.price === 'free' && img.price !== 'free') return false
                if (filters.price === 'premium' && img.price !== 'premium') return false
            }
            return true
        })
    }, [filters, searchQuery, bankImages])

    // Calculate counts for sidebar
    const counts = useMemo(() => {
        const c = {}
        bankImages.forEach(img => {
            c[img.category] = (c[img.category] || 0) + 1
        })
        return c
    }, [bankImages])

    if (loading) return <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', textAlign: 'center' }}>Chargement...</div>

    return (
        <div style={{ paddingTop: 'var(--header-height)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* HEROS SEARCH SECTION */}
            <div style={{
                background: 'var(--sn-black)',
                padding: 'var(--sp-12) var(--sp-6) var(--sp-16)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Abstract Background Decoration */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(212, 165, 116, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }} />

                <div className="container" style={{ position: 'relative', maxWidth: '900px', textAlign: 'center' }}>
                    <h1 style={{ color: 'white', marginBottom: 'var(--sp-6)', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        Trouvez l'image parfaite du Sénégal
                    </h1>

                    <div style={{
                        position: 'relative',
                        maxWidth: '700px',
                        margin: '0 auto',
                        background: 'white',
                        borderRadius: 'var(--radius-full)',
                        padding: 'var(--sp-2)',
                        display: 'flex',
                        alignItems: 'center',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ padding: '0 var(--sp-4)', color: 'var(--sn-gray-light)' }}>
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher des photos (ex: Plage, Dakar, Lutte...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                flex: 1,
                                border: 'none',
                                outline: 'none',
                                fontSize: '1.1rem',
                                padding: 'var(--sp-3) 0',
                                color: 'var(--sn-black)'
                            }}
                        />
                        <button className="btn-primary" style={{ padding: 'var(--sp-3) var(--sp-6)', borderRadius: 'var(--radius-full)' }}>
                            Rechercher
                        </button>
                    </div>

                    <div style={{ marginTop: 'var(--sp-6)', display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Recherches populaires:</span>
                        {['Gorée', 'Lac Rose', 'Plage', 'Marché', 'Touba'].map(term => (
                            <button
                                key={term}
                                onClick={() => setSearchQuery(term)}
                                style={{
                                    color: 'var(--sn-sand)',
                                    borderBottom: '1px solid rgba(212, 165, 116, 0.3)',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={{ flex: 1, display: 'flex', position: 'relative' }}>

                {/* Sidebar Component */}
                <FilterSidebar
                    filters={filters}
                    setFilters={setFilters}
                    counts={counts}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Results Area */}
                <div style={{ flex: 1, padding: 'var(--sp-6)', background: 'var(--sn-cream-dark)' }}>

                    {/* Toolbar */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--sp-6)',
                        flexWrap: 'wrap',
                        gap: 'var(--sp-4)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
                            {searchQuery ? `Résultats pour "${searchQuery}"` : 'Images récentes'}
                            <span style={{ fontSize: '1rem', color: 'var(--sn-gray)', fontWeight: 'normal', marginLeft: 'var(--sp-3)' }}>
                                ({filteredImages.length} images)
                            </span>
                        </h2>

                        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                            <button
                                className="mobile-filter-toggle btn-secondary"
                                onClick={() => setIsSidebarOpen(true)}
                                style={{ alignItems: 'center', gap: '8px' }}
                            >
                                <SlidersHorizontal size={16} /> Filtres
                            </button>

                            <select style={{
                                padding: 'var(--sp-3) var(--sp-4)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--sn-border)',
                                background: 'white',
                                cursor: 'pointer'
                            }}>
                                <option>Le plus pertinent</option>
                                <option>Les plus récents</option>
                                <option>Les plus populaires</option>
                            </select>
                        </div>
                    </div>

                    {/* Gallery Grid */}
                    {filteredImages.length > 0 ? (
                        <div className="masonry">
                            {filteredImages.map((img) => (
                                <div key={img.id} className="masonry-item">
                                    <ImageCard image={img} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 'var(--sp-20) 0', color: 'var(--sn-gray)' }}>
                            <Search size={48} style={{ marginBottom: 'var(--sp-4)', opacity: 0.3 }} />
                            <h3>Aucune image trouvée</h3>
                            <p>Essayez d'ajuster vos filtres ou votre recherche.</p>
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setFilters({ categories: [], orientation: 'all', price: 'all', color: 'all' })
                                    setSearchQuery('')
                                }}
                                style={{ marginTop: 'var(--sp-4)' }}
                            >
                                Tout effacer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

