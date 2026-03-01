import React, { useState } from 'react'
import { X, ChevronDown, ChevronRight, Filter } from 'lucide-react'

const FilterSection = ({ title, children, isOpen, onToggle }) => {
    return (
        <div className="filter-section" style={{ borderBottom: '1px solid var(--sn-gray-light)', padding: 'var(--sp-4) 0' }}>
            <button
                onClick={onToggle}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: 'var(--sp-2) 0',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    color: 'var(--sn-black)'
                }}
            >
                {title}
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {isOpen && (
                <div style={{ marginTop: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                    {children}
                </div>
            )}
        </div>
    )
}

const CheckboxFilter = ({ label, count, checked, onChange }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--sn-charcoal)' }}>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            style={{ accentColor: 'var(--sn-black)', width: '16px', height: '16px' }}
        />
        <span style={{ flex: 1 }}>{label}</span>
        {count !== undefined && <span style={{ color: 'var(--sn-gray)', fontSize: '0.8rem' }}>({count})</span>}
    </label>
)

export default function FilterSidebar({
    filters,
    setFilters,
    counts = {},
    isOpen,
    onClose
}) {
    const [sections, setSections] = useState({
        categories: true,
        orientation: true,
        price: true,
        color: true
    })

    const toggleSection = (section) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const handleCategoryChange = (cat) => {
        setFilters(prev => {
            const newCats = prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
            return { ...prev, categories: newCats }
        })
    }

    const handleOrientationChange = (ori) => {
        // Single select for now to match simplicity, or multi if desired
        setFilters(prev => ({ ...prev, orientation: prev.orientation === ori ? 'all' : ori }))
    }

    const handlePriceChange = (pr) => {
        setFilters(prev => ({ ...prev, price: prev.price === pr ? 'all' : pr }))
    }

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`filter-backdrop ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 99,
                    display: isOpen ? 'block' : 'none',
                    '@media(min-width: 992px)': { display: 'none !important' } // Hidden on desktop
                }}
            />

            <aside
                className={`filter-sidebar ${isOpen ? 'open' : ''}`}
                style={{
                    width: '280px',
                    flexShrink: 0,
                    background: 'white',
                    padding: 'var(--sp-4)',
                    height: 'calc(100vh - var(--header-height) - var(--sp-4))',
                    overflowY: 'auto',
                    // Mobile styles handled by CSS class preferably, but inline for now
                    position: isOpen ? 'fixed' : 'sticky',
                    top: isOpen ? 0 : 'calc(var(--header-height) + var(--sp-4))',
                    left: 0,
                    bottom: isOpen ? 0 : 'auto',
                    zIndex: 100,
                    transform: isOpen ? 'translateX(0)' : 'none', // Mobile slide-in logic would need CSS class
                    transition: 'transform 0.3s ease'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Filtres</h3>
                    <button
                        onClick={onClose}
                        style={{ padding: 'var(--sp-1)', background: 'none', border: 'none', cursor: 'pointer', display: isOpen ? 'block' : 'none' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <FilterSection
                    title="Catégories"
                    isOpen={sections.categories}
                    onToggle={() => toggleSection('categories')}
                >
                    {['Paysages', 'Portraits', 'Architecture', 'Vie quotidienne', 'Événements', 'Gastronomie'].map(cat => (
                        <CheckboxFilter
                            key={cat}
                            label={cat}
                            checked={filters.categories.includes(cat)}
                            onChange={() => handleCategoryChange(cat)}
                            count={counts[cat]}
                        />
                    ))}
                </FilterSection>

                <FilterSection
                    title="Orientation"
                    isOpen={sections.orientation}
                    onToggle={() => toggleSection('orientation')}
                >
                    {[
                        { id: 'landscape', label: 'Paysage (Horizontal)' },
                        { id: 'portrait', label: 'Portrait (Vertical)' },
                        { id: 'square', label: 'Carré' }
                    ].map(opt => (
                        <CheckboxFilter
                            key={opt.id}
                            label={opt.label}
                            checked={filters.orientation === opt.id}
                            onChange={() => handleOrientationChange(opt.id)}
                        />
                    ))}
                </FilterSection>

                <FilterSection
                    title="Prix et Licence"
                    isOpen={sections.price}
                    onToggle={() => toggleSection('price')}
                >
                    {[
                        { id: 'free', label: 'Gratuites (avec attribution)' },
                        { id: 'premium', label: 'Premium (Commercial)' }
                    ].map(opt => (
                        <CheckboxFilter
                            key={opt.id}
                            label={opt.label}
                            checked={filters.price === opt.id}
                            onChange={() => handlePriceChange(opt.id)}
                        />
                    ))}
                </FilterSection>
            </aside>
        </>
    )
}
