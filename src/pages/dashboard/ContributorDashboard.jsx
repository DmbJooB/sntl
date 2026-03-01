import React, { useState, useRef, useEffect } from 'react'
import { Camera, BarChart2, DollarSign, Image as ImageIcon, Settings, Upload, X, Trash2, CheckCircle2, MapPin, Edit3, Download } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import ImageCard from '../../components/image-bank/ImageCard'
import { useAuth } from '../../contexts/AuthContext'
import { getBankImages, getWalks, uploadImageToStorage, addImage, updateWalk } from '../../services/db'

function LocationPicker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng)
        },
    })
    return position ? <Marker position={position} /> : null
}

export default function ContributorDashboard() {
    const { currentUser } = useAuth()
    const [isMember, setIsMember] = useState(true) // Simulation mode
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState([])
    const [preciseLocation, setPreciseLocation] = useState({ lat: 14.6928, lng: -17.4467 }) // Default to Dakar
    const [uploadDestination, setUploadDestination] = useState('walk') // defaults to 'walk' for members, 'bank' for contributors
    const [selectedUploadWalk, setSelectedUploadWalk] = useState('')
    const fileInputRef = useRef(null)

    // New state for tabs
    const [activeTab, setActiveTab] = useState('overview')

    const [walksList, setWalksList] = useState([])
    const [myPhotos, setMyPhotos] = useState([])
    const [recentPhotos, setRecentPhotos] = useState([])

    // Profile State
    const [profileData, setProfileData] = useState({
        displayName: '',
        bio: 'Photographe passionnée par les paysages urbains et la culture sénégalaise.',
        instagram: '',
        twitter: ''
    })

    useEffect(() => {
        if (currentUser) {
            setProfileData(prev => ({ ...prev, displayName: currentUser.displayName || '' }))

            getWalks().then(setWalksList)

            getBankImages().then(imgs => {
                const mine = imgs.filter(img => img.photographerId === currentUser.uid || img.photographer === currentUser.displayName)
                setMyPhotos(mine)
                setRecentPhotos(mine.slice(0, 4))
            })
        }
    }, [currentUser])

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                preview: URL.createObjectURL(file), // create local preview
                name: file.name
            }))
            setSelectedFiles(prev => [...prev, ...newFiles])
        }
    }

    const removeFile = (indexToRemove) => {
        setSelectedFiles(files => files.filter((_, index) => index !== indexToRemove))
    }

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleUploadSubmit = async (e) => {
        e.preventDefault()
        if (selectedFiles.length === 0) return

        setIsSubmitting(true)
        try {
            const uploadedUrls = []

            for (const item of selectedFiles) {
                const url = await uploadImageToStorage(item.file, uploadDestination === 'bank' ? 'bank' : 'walks')
                if (url) uploadedUrls.push({ url, name: item.name })
            }

            if (uploadDestination === 'bank') {
                for (const uploaded of uploadedUrls) {
                    await addImage({
                        title: uploaded.name,
                        url: uploaded.url,
                        photographerId: currentUser.uid,
                        photographer: currentUser.displayName || 'Inconnu',
                        status: 'pending',
                        createdAt: new Date().toISOString()
                    })
                }
            } else if (uploadDestination === 'walk' && selectedUploadWalk) {
                const walk = walksList.find(w => String(w.id) === String(selectedUploadWalk))
                if (walk) {
                    const newPhotos = uploadedUrls.map(u => ({
                        url: u.url,
                        title: u.name,
                        photographerId: currentUser.uid,
                        photographer: currentUser.displayName,
                        addedAt: new Date().toISOString()
                    }))

                    await updateWalk(walk.id, {
                        ...walk,
                        photos: [...(walk.photos || []), ...newPhotos]
                    })
                }
            }

            const destinationLabel = uploadDestination === 'bank' ? "la banque d'images" : "la randonnée"
            alert(`Succès! ${selectedFiles.length} photos envoyées vers ${destinationLabel}`)
            setSelectedFiles([])
            setIsUploading(false)

        } catch (error) {
            console.error("Erreur d'upload:", error)
            alert("Une erreur s'est produite durant l'envoi.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div style={{ paddingTop: 'calc(var(--header-height) + var(--sp-8))', minHeight: '100vh', background: '#f9f9f9', paddingBottom: 'var(--sp-12)' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-8)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                        <h1 style={{ fontSize: '2rem', margin: 0 }}>Espace {isMember ? 'Membre' : 'Contributeur'}</h1>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--sn-gray)', background: '#eee', padding: '4px 8px', borderRadius: '4px' }}>
                            <input type="checkbox" checked={isMember} onChange={() => {
                                setIsMember(!isMember)
                                setUploadDestination(!isMember ? 'walk' : 'bank')
                            }} />
                            Activer statut Membre (Démo)
                        </label>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => setIsUploading(!isUploading)}
                    >
                        {isUploading ? <><X size={18} /> Annuler l'upload</> : <><Camera size={18} /> Uploader de nouvelles photos</>}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 'var(--sp-8)' }}>
                    {/* Sidebar */}
                    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-5)', border: '1px solid var(--sn-border)', height: 'fit-content' }}>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                            <button
                                onClick={() => setActiveTab('overview')}
                                style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: '10px 12px', background: activeTab === 'overview' ? '#f5f5f5' : 'transparent', borderRadius: 'var(--radius-sm)', fontWeight: activeTab === 'overview' ? 600 : 400, color: activeTab === 'overview' ? 'var(--sn-black)' : 'var(--sn-gray)', textDecoration: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                                <BarChart2 size={18} /> Vue d'ensemble
                            </button>
                            <button
                                onClick={() => setActiveTab('portfolio')}
                                style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: '10px 12px', background: activeTab === 'portfolio' ? '#f5f5f5' : 'transparent', borderRadius: 'var(--radius-sm)', fontWeight: activeTab === 'portfolio' ? 600 : 400, color: activeTab === 'portfolio' ? 'var(--sn-black)' : 'var(--sn-gray)', textDecoration: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                                <ImageIcon size={18} /> Mon Portfolio ({myPhotos.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('sales')}
                                style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: '10px 12px', background: activeTab === 'sales' ? '#f5f5f5' : 'transparent', borderRadius: 'var(--radius-sm)', fontWeight: activeTab === 'sales' ? 600 : 400, color: activeTab === 'sales' ? 'var(--sn-black)' : 'var(--sn-gray)', textDecoration: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                                <DollarSign size={18} /> Ventes & Revenus
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: '10px 12px', background: activeTab === 'profile' ? '#f5f5f5' : 'transparent', borderRadius: 'var(--radius-sm)', fontWeight: activeTab === 'profile' ? 600 : 400, color: activeTab === 'profile' ? 'var(--sn-black)' : 'var(--sn-gray)', textDecoration: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                                <Settings size={18} /> Profil Public
                            </button>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

                        {isUploading && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)', marginBottom: 'var(--sp-6)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)', paddingBottom: 'var(--sp-4)', borderBottom: '1px solid var(--sn-border-light)' }}>
                                    <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Nouvelle publication</h2>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--sn-gray)' }}>Ajoutez plusieurs photos en même temps.</p>
                                </div>

                                {/* Destination Selector */}
                                {isMember && (
                                    <div style={{ marginBottom: 'var(--sp-6)', border: '1px solid var(--sn-border)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', background: '#fafafa' }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--sp-3)' }}>1. Choisir la destination</h3>
                                        <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                <input type="radio" name="destination" checked={uploadDestination === 'bank'} onChange={() => setUploadDestination('bank')} />
                                                Banque d'images
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                <input type="radio" name="destination" checked={uploadDestination === 'walk'} onChange={() => setUploadDestination('walk')} />
                                                Galerie d'une Randonnée
                                            </label>
                                        </div>

                                        {uploadDestination === 'walk' && (
                                            <div style={{ marginTop: 'var(--sp-4)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Sélectionner la randonnée cible :</label>
                                                <select value={selectedUploadWalk} onChange={(e) => setSelectedUploadWalk(e.target.value)} style={{ width: '100%', maxWidth: '400px', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: 'white' }}>
                                                    <option value="" disabled>-- Choisir une randonnée --</option>
                                                    {walksList.map(w => (
                                                        <option value={w.id} key={w.id}>{w.title} ({new Date(w.date).getFullYear()})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Upload Zone */}
                                {selectedFiles.length === 0 ? (
                                    <div
                                        style={{
                                            background: '#f8fafc',
                                            borderRadius: 'var(--radius-md)',
                                            padding: 'var(--sp-10) var(--sp-4)',
                                            border: '2px dashed var(--sn-sand)',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s, border-color 0.2s',
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = 'var(--sn-primary)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'var(--sn-sand)'; }}
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/jpeg, image/png, image/webp"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            onChange={handleFileChange}
                                        />
                                        <div style={{ background: 'white', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--sp-4)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                            <Upload size={32} color="var(--sn-sand)" />
                                        </div>
                                        <h3 style={{ marginBottom: 'var(--sp-2)', color: 'var(--sn-black)', fontSize: '1.3rem' }}>Cliquez ou glissez-déposez vos photos ici</h3>
                                        <p style={{ color: 'var(--sn-gray)', marginBottom: 'var(--sp-6)', fontSize: '0.95rem' }}>
                                            JPG, PNG, TIFF, RAW (Max 50MB, minimum 4MP)
                                        </p>
                                        <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Parcourir les fichiers</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleUploadSubmit}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 320px) 1fr', gap: 'var(--sp-6)' }}>
                                                {/* Previews Sidebar */}
                                                <div>
                                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--sp-3)', color: 'var(--sn-gray-dark)' }}>Photos sélectionnées ({selectedFiles.length})</h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', maxHeight: '450px', overflowY: 'auto', paddingRight: 'var(--sp-2)' }}>
                                                        {selectedFiles.map((fileData, idx) => (
                                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', background: '#f8fafc', padding: 'var(--sp-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border-light)' }}>
                                                                <img src={fileData.preview} alt="preview" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '4px' }} />
                                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                                    <p style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px', color: 'var(--sn-black)' }}>{fileData.name}</p>
                                                                    <p style={{ fontSize: '0.75rem', color: 'var(--sn-gray)' }}>{(fileData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                                </div>
                                                                <button type="button" onClick={() => removeFile(idx)} style={{ background: 'none', border: 'none', color: 'var(--sn-error)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }} title="Supprimer">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn-secondary"
                                                        style={{ width: '100%', marginTop: 'var(--sp-4)', fontSize: '0.9rem', padding: '10px' }}
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        + Ajouter d'autres photos
                                                    </button>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/jpeg, image/png, image/webp"
                                                        ref={fileInputRef}
                                                        style={{ display: 'none' }}
                                                        onChange={handleFileChange}
                                                    />
                                                </div>

                                                {/* Global Metadata Form */}
                                                <div style={{ background: '#f8fafc', padding: 'var(--sp-6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border-light)' }}>
                                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--sp-5)', color: 'var(--sn-gray-dark)' }}>Métadonnées communes (appliquées à la sélection)</h4>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px', color: 'var(--sn-black)' }}>Lieu textuel (Ville, Quartier...)</label>
                                                            <input type="text" placeholder="Ex: Dakar, Île de Gorée, Sine Saloum..." style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: 'white', marginBottom: 'var(--sp-4)' }} />

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--sn-gray-dark)', fontSize: '0.9rem', fontWeight: 500 }}>
                                                                <MapPin size={16} /> <span>Sélectionnez la géolocalisation exacte (optionnelle)</span>
                                                            </div>
                                                            <div style={{ height: '200px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--sn-border)' }}>
                                                                <MapContainer center={preciseLocation} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                                                                    <TileLayer
                                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                                                    />
                                                                    <LocationPicker position={preciseLocation} setPosition={setPreciseLocation} />
                                                                </MapContainer>
                                                            </div>
                                                            <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginTop: '6px' }}>
                                                                Cliquez sur la carte pour définir la position exacte : Lat {preciseLocation.lat.toFixed(4)}, Lng {preciseLocation.lng.toFixed(4)}
                                                            </p>
                                                        </div>

                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                                                            <div>
                                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px', color: 'var(--sn-black)' }}>Catégorie principale</label>
                                                                <select style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: 'white' }}>
                                                                    <option>Portrait / Studio</option>
                                                                    <option>Paysage / Nature</option>
                                                                    <option>Life Style / Culture</option>
                                                                    <option>Événement / Reportage</option>
                                                                    <option>Architecture / Ville</option>
                                                                    <option>Abstrait / Artistique</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px', color: 'var(--sn-black)' }}>Licence par défaut</label>
                                                                <select style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: 'white' }}>
                                                                    <option>Droits gérés (Usage unique)</option>
                                                                    <option>Libre de droits (Royalty-Free)</option>
                                                                    <option>Usage Éditorial uniquement</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px', color: 'var(--sn-black)' }}>Mots-clés (séparés par des virgules)</label>
                                                            <textarea placeholder="Ex: sénégal, afrique de l'ouest, plage, coucher de soleil, pêcheur, pirogue..." rows={4} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: 'white', resize: 'vertical' }}></textarea>
                                                            <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginTop: '6px' }}>Ajoutez au moins 5 mots-clés pertinents pour améliorer la visibilité de vos photos.</p>
                                                        </div>
                                                    </div>

                                                    <div style={{ marginTop: 'var(--sp-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-4)', borderTop: '1px solid var(--sn-border)', paddingTop: 'var(--sp-6)' }}>
                                                        <button type="button" className="btn-secondary" onClick={() => setSelectedFiles([])} disabled={isSubmitting}>Tout effacer</button>
                                                        <button
                                                            type="submit"
                                                            className="btn-primary"
                                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', opacity: isSubmitting ? 0.7 : 1 }}
                                                            disabled={(uploadDestination === 'walk' && !selectedUploadWalk) || isSubmitting}
                                                        >
                                                            <CheckCircle2 size={20} /> {isSubmitting ? 'Envoi en cours...' : `Soumettre ${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''}`}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {activeTab === 'overview' && (
                            <>
                                {/* Stats Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-4)' }}>
                                    <div style={{ background: 'white', padding: 'var(--sp-5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border)' }}>
                                        <div style={{ color: 'var(--sn-gray)', fontSize: '0.9rem', marginBottom: 'var(--sp-2)' }}>Vues (Ce mois)</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>2,450</div>
                                        <div style={{ color: 'var(--sn-success)', fontSize: '0.85rem' }}>+12% par rapport au mois dernier</div>
                                    </div>
                                    <div style={{ background: 'white', padding: 'var(--sp-5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border)' }}>
                                        <div style={{ color: 'var(--sn-gray)', fontSize: '0.9rem', marginBottom: 'var(--sp-2)' }}>Ventes (Ce mois)</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>18</div>
                                        <div style={{ color: 'var(--sn-success)', fontSize: '0.85rem' }}>+4 ventes</div>
                                    </div>
                                    <div style={{ background: 'white', padding: 'var(--sp-5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border)' }}>
                                        <div style={{ color: 'var(--sn-gray)', fontSize: '0.9rem', marginBottom: 'var(--sp-2)' }}>Gains estimés</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>124.000 FCFA</div>
                                    </div>
                                </div>

                                {/* Recent Photos */}
                                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
                                        <h2 style={{ fontSize: '1.2rem' }}>Photos récemment ajoutées</h2>
                                        <button className="btn-secondary" onClick={() => setActiveTab('portfolio')} style={{ padding: '4px 12px', fontSize: '0.9rem' }}>Voir tout</button>
                                    </div>
                                    {recentPhotos.length > 0 ? (
                                        <div className="masonry" style={{ columns: '4 200px' }}>
                                            {recentPhotos.map(img => (
                                                <div key={img.id} className="masonry-item">
                                                    <ImageCard image={img} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--sn-gray)', textAlign: 'center', padding: 'var(--sp-6) 0' }}>Aucune photo uploaded pour le moment.</p>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'portfolio' && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
                                    <h2 style={{ fontSize: '1.4rem' }}>Mon Portfolio Entier</h2>
                                </div>
                                <div className="masonry" style={{ columns: '4 200px' }}>
                                    {myPhotos.map(img => (
                                        <div key={img.id} className="masonry-item" style={{ position: 'relative' }}>
                                            <ImageCard image={img} />
                                            {/* Dummy actions specifically for portfolio view */}
                                            <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.9)', padding: '4px', borderRadius: '6px' }}>
                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--sn-gray-dark)' }} title="Éditer Métadonnées"><Edit3 size={14} /></button>
                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--sn-error)' }} title="Supprimer"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'sales' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
                                <div style={{ background: 'white', padding: 'var(--sp-8)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-2)' }}>Solde Actuel</h3>
                                        <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--sn-black)', margin: 0 }}>245.000 FCFA</p>
                                    </div>
                                    <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
                                        Demander un Paiement
                                    </button>
                                </div>

                                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)' }}>
                                    <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--sp-4)' }}>Historique des ventes</h2>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--sn-border-light)', textAlign: 'left', color: 'var(--sn-gray)' }}>
                                                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Date</th>
                                                <th style={{ padding: '12px 8px', fontWeight: 600 }}>ID Photo</th>
                                                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Type de Licence</th>
                                                <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'right' }}>Montant</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { date: '12 Fév 2026', id: 'IMG-9012', licence: 'Usage Éditorial', amount: '15.000 FCFA' },
                                                { date: '08 Fév 2026', id: 'IMG-3341', licence: 'Droits gérés', amount: '45.000 FCFA' },
                                                { date: '29 Jan 2026', id: 'IMG-1102', licence: 'Usage Éditorial', amount: '15.000 FCFA' },
                                                { date: '14 Jan 2026', id: 'IMG-8493', licence: 'Libre de droits', amount: '5.000 FCFA' },
                                            ].map((sale, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--sn-border-light)' }}>
                                                    <td style={{ padding: '12px 8px' }}>{sale.date}</td>
                                                    <td style={{ padding: '12px 8px' }}>{sale.id}</td>
                                                    <td style={{ padding: '12px 8px', color: 'var(--sn-gray-dark)' }}>{sale.licence}</td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>{sale.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)' }}>
                                <h2 style={{ fontSize: '1.4rem', marginBottom: 'var(--sp-6)' }}>Profil Public</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 250px) 1fr', gap: 'var(--sp-8)' }}>
                                    {/* Avatar column */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-4)' }}>
                                        <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#eee', overflow: 'hidden', border: '2px solid var(--sn-border)' }}>
                                            {/* Placeholder Avatar */}
                                            <img src="https://ui-avatars.com/api/?name=Awa+Diop&background=random&size=150" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <button className="btn-secondary" style={{ fontSize: '0.85rem' }}>Modifier la photo</button>
                                    </div>
                                    {/* Forms column */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px', color: 'var(--sn-black)' }}>Nom affiché</label>
                                            <input
                                                type="text"
                                                value={profileData.displayName}
                                                onChange={e => setProfileData({ ...profileData, displayName: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: 'white' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px', color: 'var(--sn-black)' }}>Biographie</label>
                                            <textarea
                                                rows={4}
                                                value={profileData.bio}
                                                onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: 'white', resize: 'vertical' }}
                                            ></textarea>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px', color: 'var(--sn-black)' }}>Instagram</label>
                                                <input
                                                    type="text"
                                                    value={profileData.instagram}
                                                    onChange={e => setProfileData({ ...profileData, instagram: e.target.value })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: 'white' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px', color: 'var(--sn-black)' }}>Twitter / X</label>
                                                <input
                                                    type="text"
                                                    value={profileData.twitter}
                                                    onChange={e => setProfileData({ ...profileData, twitter: e.target.value })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: 'white' }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: 'var(--sp-4)', textAlign: 'right' }}>
                                            <button className="btn-primary" onClick={() => alert('Profil sauvegardé !')}>Enregistrer les modifications</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}
