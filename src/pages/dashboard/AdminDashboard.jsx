import React, { useState, useEffect } from 'react'
import { Users, Image as ImageIcon, Map as MapIcon, Settings, LayoutDashboard, ShieldCheck, Check, X, Edit, Trash2, Search, User, Shield, Ban, UploadCloud, Plus } from 'lucide-react'
import { getWalks, getUsers, getPendingImages, approveImage, rejectImage, getAppearanceSettings, updateAppearanceSettings, uploadImageToStorage, addImage, addWalk, updateWalk, deleteWalk } from '../../services/db'

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview')
    const [pendingPhotos, setPendingPhotos] = useState([])
    const [walksList, setWalksList] = useState([])
    const [userSearch, setUserSearch] = useState('')
    const [usersList, setUsersList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [walks, users, pending, settings] = await Promise.all([
                    getWalks(),
                    getUsers(),
                    getPendingImages(),
                    getAppearanceSettings()
                ]);

                if (isMounted) {
                    setWalksList(walks);
                    setUsersList(users.map((u, i) => ({
                        id: u.uid || u.id,
                        name: u.displayName || u.name || 'Inconnu',
                        email: u.email || `${u.slug || 'user'}@example.com`,
                        role: u.role || (i === 0 ? 'Administrateur' : (u.isMember ? 'Membre' : 'Utilisateur')),
                        status: 'Actif',
                        ...u
                    })));
                    setPendingPhotos(pending);
                    if (settings) {
                        setAppearanceSettings(prev => ({ ...prev, ...settings }));
                    }
                    setError(null);
                }
            } catch (err) {
                console.error("AdminDashboard fetch error:", err);
                if (isMounted) setError("Erreur lors du chargement des données. Veuillez vérifier votre connexion.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [])

    // Admin Upload State
    const [uploadDestination, setUploadDestination] = useState('bank') // 'bank' or 'walk'
    const [selectedUploadWalk, setSelectedUploadWalk] = useState('')
    const [uploadFiles, setUploadFiles] = useState([])
    const [isUploadingFiles, setIsUploadingFiles] = useState(false)

    // Appearance Settings State
    const [appearanceSettings, setAppearanceSettings] = useState({
        siteName: 'Sunu Nataal',
        contactEmail: 'support@sununataal.com',
        pricingDigitalWeb: 2500,
        pricingDigitalPrint: 7500,
        pricingDigitalCommercial: 50000,
        revenueShareDigitalPhoto: 70,
        pricingPrintSmall: 15000,
        pricingPrintMedium: 25000,
        pricingPrintLarge: 40000,
        pricingFrameStandard: 10000,
        pricingFramePremium: 25000,
        pricingPassePartout: 5000,
        revenueSharePrintPrinter: 30,
        revenueSharePrintPhoto: 60,
        homeCover: '',
        walksCover: '',
        footerLinks: [
            { id: 1, label: 'À propos', url: '/about' },
            { id: 2, label: 'Conditions Générales', url: '/terms' },
            { id: 3, label: 'Politique de confidentialité', url: '/privacy' },
            { id: 4, label: 'Contactez-nous', url: '/contact' }
        ],
        mainMenuLinks: [
            { id: 1, label: 'Accueil', url: '/' },
            { id: 2, label: "La Banque d'images", url: '/image-bank' },
            { id: 3, label: 'Les Randonnées', url: '/randonnees' },
            { id: 4, label: 'Le Collectif', url: '/photographers' }
        ]
    })

    const handleSettingChange = (field, value) => {
        setAppearanceSettings(prev => ({ ...prev, [field]: value }))
    }

    const handleAddLink = (section) => {
        setAppearanceSettings(prev => ({
            ...prev,
            [section]: [...prev[section], { id: Date.now(), label: '', url: '' }]
        }))
    }

    const handleUpdateLink = (section, id, field, value) => {
        setAppearanceSettings(prev => ({
            ...prev,
            [section]: prev[section].map(link => link.id === id ? { ...link, [field]: value } : link)
        }))
    }

    const handleRemoveLink = (section, id) => {
        setAppearanceSettings(prev => ({
            ...prev,
            [section]: prev[section].filter(link => link.id !== id)
        }))
    }

    const handleCoverUpload = (e, field) => {
        if (e.target.files && e.target.files.length > 0) {
            setAppearanceSettings(prev => ({
                ...prev,
                [field]: URL.createObjectURL(e.target.files[0])
            }))
        }
    }

    // Modal state for Walk/Event Add & Edit
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingWalk, setEditingWalk] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        maxParticipants: '',
        category: 'photowalk',
        description: '',
        cover: '',
        photographerId: ''
    })

    const openModal = (walk = null) => {
        if (walk) {
            setEditingWalk(walk)
            setFormData({
                title: walk.title,
                date: walk.date,
                startTime: walk.time?.split(' - ')[0] || '',
                endTime: walk.time?.split(' - ')[1] || '',
                location: walk.location,
                maxParticipants: walk.maxParticipants,
                category: walk.category || 'photowalk',
                description: walk.description,
                cover: walk.cover || '',
                photographerId: walk.photographerId || ''
            })
        } else {
            setEditingWalk(null)
            setFormData({
                title: '',
                date: '',
                startTime: '',
                endTime: '',
                location: '',
                maxParticipants: '',
                category: 'photowalk',
                description: '',
                cover: '',
                photographerId: ''
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingWalk(null)
    }

    const handleFormChange = (e) => {
        const { name, value, type, files } = e.target
        if (type === 'file' && files.length > 0) {
            // Using createObjectURL as a mock upload.
            setFormData(prev => ({ ...prev, [name]: URL.createObjectURL(files[0]) }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSaveWalk = async (e) => {
        e.preventDefault()
        const computedStatus = (new Date(`${formData.date}T${formData.endTime || '23:59'}`) < new Date()) ? 'past' : 'upcoming'
        const timeString = formData.startTime && formData.endTime ? `${formData.startTime} - ${formData.endTime}` : formData.startTime || ''

        try {
            if (editingWalk) {
                const updatedData = {
                    ...formData,
                    status: computedStatus,
                    time: timeString
                }
                await updateWalk(editingWalk.id, updatedData)
                setWalksList(walksList.map(w => w.id === editingWalk.id ? { ...w, ...updatedData } : w))
            } else {
                const newWalkData = {
                    ...formData,
                    participants: 0,
                    status: computedStatus,
                    time: timeString,
                    slug: formData.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                    cover: formData.cover || 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&h=500&fit=crop',
                    photos: [],
                    createdAt: new Date().toISOString()
                }
                const saved = await addWalk(newWalkData)
                setWalksList([...walksList, saved])
            }
        } catch (err) {
            console.error('Failed to save walk:', err)
            alert('Erreur lors de la sauvegarde. Vérifiez la console.')
        }
        closeModal()
    }

    // User Modal State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false)
    const [userFormData, setUserFormData] = useState({
        name: '',
        email: '',
        role: 'Utilisateur',
        status: 'Actif'
    })

    const openUserModal = () => {
        setUserFormData({ name: '', email: '', role: 'Utilisateur', status: 'Actif' })
        setIsUserModalOpen(true)
    }

    const handleUserFormChange = (e) => {
        const { name, value } = e.target
        setUserFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSaveUser = (e) => {
        e.preventDefault()
        // TODO: Implémenter la création d'utilisateur via Cloud Functions ou Firebase Admin SDK
        // Pour l'instant, on met à jour uniquement l'état local pour la démo
        const newUser = {
            id: `new_user_${Date.now()}`,
            uid: `new_user_${Date.now()}`,
            ...userFormData
        }
        setUsersList([...usersList, newUser])
        setIsUserModalOpen(false)
    }

    const filteredUsers = usersList.filter(user =>
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase())
    )

    const handleModerate = async (id, action) => {
        try {
            if (action === 'accept') {
                await approveImage(id)
            } else {
                await rejectImage(id)
            }
            setPendingPhotos(pendingPhotos.filter(photo => photo.id !== id))
            console.log(`Photo ${id} ${action === 'accept' ? 'accepted' : 'rejected'}`)
        } catch (error) {
            console.error("Error moderating image:", error)
            alert("Une erreur est survenue lors de la modération")
        }
    }

    const handleDeleteWalk = async (id) => {
        if (!window.confirm('Supprimer cette randonnée ? Cette action est irréversible.')) return
        try {
            await deleteWalk(id)
            setWalksList(walksList.filter(walk => walk.id !== id))
        } catch (err) {
            console.error('Failed to delete walk:', err)
            alert('Erreur lors de la suppression.')
        }
    }

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
            <div className="container" style={{ maxWidth: '1400px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-8)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                        <ShieldCheck size={32} color="var(--sn-sand)" />
                        <h1 style={{ fontSize: '2rem' }}>Administration Sunu Nataal</h1>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 'var(--sp-8)' }}>
                    {/* Sidebar */}
                    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-5)', border: '1px solid var(--sn-border)', height: 'fit-content' }}>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                            <button onClick={() => setActiveTab('overview')} style={navItemStyle('overview')}>
                                <LayoutDashboard size={18} /> Vue d'ensemble
                            </button>
                            <button onClick={() => setActiveTab('users')} style={navItemStyle('users')}>
                                <Users size={18} /> Utilisateurs (1,240)
                            </button>
                            <button onClick={() => setActiveTab('photos')} style={navItemStyle('photos')}>
                                <ImageIcon size={18} /> Modération Photos
                                {pendingPhotos.length > 0 && (
                                    <span style={{ background: 'var(--sn-sand)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', marginLeft: 'auto' }}>
                                        {pendingPhotos.length}
                                    </span>
                                )}
                            </button>
                            <button onClick={() => setActiveTab('walks')} style={navItemStyle('walks')}>
                                <MapIcon size={18} /> Randonnées
                            </button>
                            <button onClick={() => setActiveTab('uploads')} style={navItemStyle('uploads')}>
                                <UploadCloud size={18} /> Uploads & Imports
                            </button>
                            <button onClick={() => setActiveTab('settings')} style={navItemStyle('settings')}>
                                <Settings size={18} /> Configuration
                            </button>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

                        {(activeTab === 'overview' || activeTab === 'photos') && (
                            <>
                                {/* Stats Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-4)' }}>
                                    <div style={{ background: 'white', padding: 'var(--sp-5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border)' }}>
                                        <div style={{ color: 'var(--sn-gray)', fontSize: '0.9rem', marginBottom: 'var(--sp-2)' }}>Utilisateurs Inscrits</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>1,240</div>
                                    </div>
                                    <div style={{ background: 'white', padding: 'var(--sp-5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border)' }}>
                                        <div style={{ color: 'var(--sn-gray)', fontSize: '0.9rem', marginBottom: 'var(--sp-2)' }}>Photographes Validés</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>45</div>
                                    </div>
                                    <div style={{ background: 'white', padding: 'var(--sp-5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border)' }}>
                                        <div style={{ color: 'var(--sn-gray)', fontSize: '0.9rem', marginBottom: 'var(--sp-2)' }}>Images en Banque</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>8,432</div>
                                    </div>
                                    <div style={{ background: 'white', padding: 'var(--sp-5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border)' }}>
                                        <div style={{ color: 'var(--sn-gray)', fontSize: '0.9rem', marginBottom: 'var(--sp-2)' }}>Revenus (Ce mois)</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>1.2M FCFA</div>
                                    </div>
                                </div>

                                {/* Approvals */}
                                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)' }}>
                                    <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--sp-4)' }}>Photos en attente de modération</h2>
                                    {pendingPhotos.length === 0 ? (
                                        <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--sn-gray)', background: '#f9f9f9', borderRadius: 'var(--radius-md)' }}>
                                            <ShieldCheck size={48} style={{ margin: '0 auto var(--sp-4)', opacity: 0.3 }} />
                                            <p>Toutes les photos ont été modérées. Bon travail !</p>
                                        </div>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid var(--sn-border)', color: 'var(--sn-gray)' }}>
                                                    <th style={{ padding: '12px 0' }}>Aperçu</th>
                                                    <th style={{ padding: '12px 0' }}>Photographe</th>
                                                    <th style={{ padding: '12px 0' }}>Titre</th>
                                                    <th style={{ padding: '12px 0' }}>Date</th>
                                                    <th style={{ padding: '12px 0', textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingPhotos.map(photo => (
                                                    <tr key={photo.id} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '12px 0' }}><div style={{ width: 60, height: 40, background: '#eee', borderRadius: '4px' }}></div></td>
                                                        <td style={{ padding: '12px 0', fontWeight: 500 }}>{photo.photographer}</td>
                                                        <td style={{ padding: '12px 0' }}>{photo.title}</td>
                                                        <td style={{ padding: '12px 0', color: 'var(--sn-gray)' }}>{photo.date}</td>
                                                        <td style={{ padding: '12px 0', textAlign: 'right' }}>
                                                            <button
                                                                onClick={() => handleModerate(photo.id, 'reject')}
                                                                className="btn-secondary"
                                                                style={{ padding: '6px 10px', fontSize: '0.8rem', marginRight: '8px', color: 'var(--sn-error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                            >
                                                                <X size={14} style={{ display: 'inline', marginRight: '4px' }} /> Refuser
                                                            </button>
                                                            <button
                                                                onClick={() => handleModerate(photo.id, 'accept')}
                                                                className="btn-primary"
                                                                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                                            >
                                                                <Check size={14} style={{ display: 'inline', marginRight: '4px' }} /> Accepter
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'walks' && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
                                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Gestion des Randonnées</h2>
                                    <button onClick={() => openModal()} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>+ Nouvelle Randonnée</button>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--sn-border)', color: 'var(--sn-gray)' }}>
                                            <th style={{ padding: '12px 0' }}>Titre</th>
                                            <th style={{ padding: '12px 0' }}>Catégorie</th>
                                            <th style={{ padding: '12px 0' }}>Date</th>
                                            <th style={{ padding: '12px 0' }}>Lieu</th>
                                            <th style={{ padding: '12px 0' }}>Statut</th>
                                            <th style={{ padding: '12px 0' }}>Guide</th>
                                            <th style={{ padding: '12px 0' }}>Participants</th>
                                            <th style={{ padding: '12px 0', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {walksList.map(walk => (
                                            <tr key={walk.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '16px 0', fontWeight: 600, color: 'var(--sn-black)' }}>{walk.title}</td>
                                                <td style={{ padding: '16px 0', color: 'var(--sn-gray)', textTransform: 'capitalize' }}>
                                                    {walk.category === 'exhibition' ? 'Exposition' :
                                                        walk.category === 'workshop' ? 'Workshop' :
                                                            walk.category === 'masterclass' ? 'Masterclass' :
                                                                walk.category === 'other' ? 'Autre' : 'Randonnée'}
                                                </td>
                                                <td style={{ padding: '16px 0', color: 'var(--sn-gray)' }}>{walk.date}</td>
                                                <td style={{ padding: '16px 0', color: 'var(--sn-gray)' }}>{walk.location}</td>
                                                <td style={{ padding: '16px 0' }}>
                                                    <span style={{
                                                        background: walk.status === 'upcoming' ? 'rgba(46, 125, 50, 0.1)' : '#f5f5f5',
                                                        color: walk.status === 'upcoming' ? 'var(--sn-success)' : 'var(--sn-gray)',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 500
                                                    }}>
                                                        {walk.status === 'upcoming' ? 'À venir' : 'Terminée'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 0', color: 'var(--sn-gray)' }}>
                                                    {walk.photographerId ? usersList.find(u => u.uid === walk.photographerId || String(u.id) === String(walk.photographerId))?.name || 'Inconnu' : '-'}
                                                </td>
                                                <td style={{ padding: '16px 0', color: 'var(--sn-gray)' }}>{walk.participants} / {walk.maxParticipants}</td>
                                                <td style={{ padding: '16px 0', textAlign: 'right' }}>
                                                    <button onClick={() => openModal(walk)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--sn-gray)', marginRight: '8px' }} title="Modifier">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteWalk(walk.id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--sn-error)' }}
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
                                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Gestion des Utilisateurs</h2>
                                    <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
                                        <div style={{ position: 'relative', width: '300px' }}>
                                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sn-gray)' }} />
                                            <input
                                                type="text"
                                                placeholder="Rechercher par nom ou email..."
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '0.95rem' }}
                                            />
                                        </div>
                                        <button onClick={openUserModal} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>+ Nouvel Utilisateur</button>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--sn-border)', color: 'var(--sn-gray)' }}>
                                            <th style={{ padding: '12px 0' }}>Nom</th>
                                            <th style={{ padding: '12px 0' }}>Email</th>
                                            <th style={{ padding: '12px 0' }}>Rôle</th>
                                            <th style={{ padding: '12px 0' }}>Statut</th>
                                            <th style={{ padding: '12px 0', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map(user => (
                                                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '16px 0', fontWeight: 600, color: 'var(--sn-black)' }}>{user.name}</td>
                                                    <td style={{ padding: '16px 0', color: 'var(--sn-gray)' }}>{user.email}</td>
                                                    <td style={{ padding: '16px 0' }}>
                                                        <span style={{
                                                            background: user.role === 'Administrateur' ? 'rgba(79, 70, 229, 0.1)' : (user.role === 'Contributeur' ? 'rgba(16, 185, 129, 0.1)' : '#f5f5f5'),
                                                            color: user.role === 'Administrateur' ? '#4f46e5' : (user.role === 'Contributeur' ? '#10b981' : 'var(--sn-gray)'),
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 500
                                                        }}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px 0' }}>
                                                        <span style={{
                                                            background: user.status === 'Actif' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            color: user.status === 'Actif' ? 'var(--sn-success)' : 'var(--sn-error)',
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 500
                                                        }}>
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px 0', textAlign: 'right' }}>
                                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--sn-gray)', marginRight: '8px' }} title="Voir le profil">
                                                            <User size={16} />
                                                        </button>
                                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--sn-gray)', marginRight: '8px' }} title="Modifier le rôle">
                                                            <Shield size={16} />
                                                        </button>
                                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--sn-error)' }} title="Bannir">
                                                            <Ban size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '24px 0', textAlign: 'center', color: 'var(--sn-gray)' }}>
                                                    Aucun utilisateur trouvé
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'uploads' && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
                                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Importer des Photos</h2>
                                </div>
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

                                <div style={{ marginBottom: 'var(--sp-6)', border: '1px dashed var(--sn-border)', padding: 'var(--sp-8)', borderRadius: 'var(--radius-md)', textAlign: 'center', background: '#fafafa' }}>
                                    <UploadCloud size={48} color="var(--sn-gray-light)" style={{ margin: '0 auto var(--sp-4)' }} />
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--sp-2)' }}>Glissez vos fichiers ici</h3>
                                    <p style={{ color: 'var(--sn-gray)', marginBottom: 'var(--sp-4)', fontSize: '0.9rem' }}>Formats acceptés : JPG, PNG, RAW. Max 50MB par fichier.</p>
                                    <label className="btn-secondary" style={{ display: 'inline-flex', padding: '10px 24px', cursor: 'pointer' }}>
                                        Sélectionner des fichiers
                                        <input type="file" multiple hidden onChange={(e) => setUploadFiles(Array.from(e.target.files))} />
                                    </label>
                                </div>

                                {uploadFiles.length > 0 && (
                                    <div style={{ marginBottom: 'var(--sp-6)' }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--sp-3)' }}>2. Fichiers sélectionnés ({uploadFiles.length})</h3>
                                        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                                            {uploadFiles.slice(0, 5).map((f, i) => (
                                                <div key={i} style={{ width: 80, height: 80, borderRadius: 'var(--radius-sm)', background: '#eee', overflow: 'hidden' }}>
                                                    <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                            {uploadFiles.length > 5 && (
                                                <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-sm)', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'var(--sn-gray)' }}>
                                                    +{uploadFiles.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        className="btn-primary"
                                        disabled={uploadFiles.length === 0 || (uploadDestination === 'walk' && !selectedUploadWalk) || isUploadingFiles}
                                        onClick={async () => {
                                            setIsUploadingFiles(true)
                                            try {
                                                const uploadedUrls = []
                                                for (const file of uploadFiles) {
                                                    const url = await uploadImageToStorage(file, uploadDestination === 'bank' ? 'bank' : 'walks')
                                                    if (url) uploadedUrls.push({ url, name: file.name })
                                                }

                                                if (uploadDestination === 'bank') {
                                                    for (const uploaded of uploadedUrls) {
                                                        await addImage({
                                                            title: uploaded.name,
                                                            url: uploaded.url,
                                                            photographerId: 'admin',
                                                            photographer: 'SNTL Admin',
                                                            status: 'approved',
                                                            createdAt: new Date().toISOString()
                                                        })
                                                    }
                                                } else if (uploadDestination === 'walk' && selectedUploadWalk) {
                                                    const walk = walksList.find(w => String(w.id) === String(selectedUploadWalk))
                                                    if (walk) {
                                                        const newPhotos = uploadedUrls.map(u => ({
                                                            id: `photo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                                                            url: u.url,
                                                            title: u.name,
                                                            photographerId: 'admin',
                                                            photographer: 'SNTL Admin',
                                                            addedAt: new Date().toISOString()
                                                        }))
                                                        await updateWalk(walk.id, {
                                                            photos: [...(walk.photos || []), ...newPhotos]
                                                        })
                                                    }
                                                }

                                                alert(`Succès : ${uploadFiles.length} photo(s) importée(s) vers ${uploadDestination === 'bank' ? "la banque d'images" : "la randonnée"}.`)
                                                setUploadFiles([])
                                            } catch (error) {
                                                console.error("Upload error", error)
                                                alert("Erreur lors de l'import")
                                            } finally {
                                                setIsUploadingFiles(false)
                                            }
                                        }}
                                    >
                                        {isUploadingFiles ? 'Import en cours...' : "Démarrer l'import"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', border: '1px solid var(--sn-border)' }}>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--sp-6)' }}>Configuration de la Plateforme</h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>

                                    {/* Apparence & Visuel (Nouveau) */}
                                    <section style={{ background: '#f8fafc', padding: 'var(--sp-6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border-light)' }}>
                                        <h3 style={{ fontSize: '1.2rem', color: 'var(--sn-black)', marginBottom: 'var(--sp-6)', borderBottom: '2px solid var(--sn-sand-pale)', paddingBottom: 'var(--sp-3)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                            <ImageIcon size={20} /> Apparence & Visuel
                                        </h3>

                                        <div style={{ marginBottom: 'var(--sp-8)' }}>
                                            <h4 style={{ fontSize: '1.05rem', marginBottom: 'var(--sp-4)', color: 'var(--sn-gray-dark)' }}>Images de Couverture</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--sp-6)' }}>
                                                {/* Home Cover */}
                                                <div style={{ background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', padding: 'var(--sp-4)' }}>
                                                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>Page d'Accueil</label>
                                                    <div style={{ position: 'relative', height: '150px', background: '#f0f0f0', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 'var(--sp-3)', border: '1px dashed var(--sn-border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {appearanceSettings.homeCover ? (
                                                            <img src={appearanceSettings.homeCover} alt="Home Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ textAlign: 'center', color: 'var(--sn-gray)' }}>
                                                                <UploadCloud size={32} style={{ margin: '0 auto var(--sp-2)' }} />
                                                                <span style={{ fontSize: '0.85rem' }}>Aucune image</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <label className="btn-secondary" style={{ display: 'block', textAlign: 'center', padding: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                        Changer l'image
                                                        <input type="file" accept="image/*" hidden onChange={(e) => handleCoverUpload(e, 'homeCover')} />
                                                    </label>
                                                </div>

                                                {/* Walks Cover */}
                                                <div style={{ background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', padding: 'var(--sp-4)' }}>
                                                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>Page Randonnées</label>
                                                    <div style={{ position: 'relative', height: '150px', background: '#f0f0f0', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 'var(--sp-3)', border: '1px dashed var(--sn-border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {appearanceSettings.walksCover ? (
                                                            <img src={appearanceSettings.walksCover} alt="Walks Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ textAlign: 'center', color: 'var(--sn-gray)' }}>
                                                                <UploadCloud size={32} style={{ margin: '0 auto var(--sp-2)' }} />
                                                                <span style={{ fontSize: '0.85rem' }}>Aucune image</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <label className="btn-secondary" style={{ display: 'block', textAlign: 'center', padding: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                        Changer l'image
                                                        <input type="file" accept="image/*" hidden onChange={(e) => handleCoverUpload(e, 'walksCover')} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gap: 'var(--sp-8)' }}>
                                            {/* Main Menu Links */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
                                                    <h4 style={{ fontSize: '1.05rem', color: 'var(--sn-gray-dark)', margin: 0 }}>Menu Principal</h4>
                                                    <button onClick={() => handleAddLink('mainMenuLinks')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Plus size={14} /> Ajouter un lien
                                                    </button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                                                    {appearanceSettings.mainMenuLinks.map((link) => (
                                                        <div key={link.id} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', background: 'white', padding: 'var(--sp-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                            <input
                                                                type="text"
                                                                placeholder="Titre (ex: Accueil)"
                                                                value={link.label}
                                                                onChange={(e) => handleUpdateLink('mainMenuLinks', link.id, 'label', e.target.value)}
                                                                style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '0.9rem' }}
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="URL (ex: /)"
                                                                value={link.url}
                                                                onChange={(e) => handleUpdateLink('mainMenuLinks', link.id, 'url', e.target.value)}
                                                                style={{ flex: 2, padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '0.9rem' }}
                                                            />
                                                            <button onClick={() => handleRemoveLink('mainMenuLinks', link.id)} style={{ background: 'none', border: 'none', color: 'var(--sn-error)', cursor: 'pointer', padding: '4px' }} title="Supprimer le lien">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {appearanceSettings.mainMenuLinks.length === 0 && (
                                                        <p style={{ color: 'var(--sn-gray)', fontSize: '0.9rem', fontStyle: 'italic' }}>Aucun lien configuré.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Footer Links */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
                                                    <h4 style={{ fontSize: '1.05rem', color: 'var(--sn-gray-dark)', margin: 0 }}>Pied de page (Footer)</h4>
                                                    <button onClick={() => handleAddLink('footerLinks')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Plus size={14} /> Ajouter un lien
                                                    </button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                                                    {appearanceSettings.footerLinks.map((link) => (
                                                        <div key={link.id} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', background: 'white', padding: 'var(--sp-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                            <input
                                                                type="text"
                                                                placeholder="Titre (ex: Contact)"
                                                                value={link.label}
                                                                onChange={(e) => handleUpdateLink('footerLinks', link.id, 'label', e.target.value)}
                                                                style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '0.9rem' }}
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="URL (ex: /contact)"
                                                                value={link.url}
                                                                onChange={(e) => handleUpdateLink('footerLinks', link.id, 'url', e.target.value)}
                                                                style={{ flex: 2, padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '0.9rem' }}
                                                            />
                                                            <button onClick={() => handleRemoveLink('footerLinks', link.id)} style={{ background: 'none', border: 'none', color: 'var(--sn-error)', cursor: 'pointer', padding: '4px' }} title="Supprimer le lien">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {appearanceSettings.footerLinks.length === 0 && (
                                                        <p style={{ color: 'var(--sn-gray)', fontSize: '0.9rem', fontStyle: 'italic' }}>Aucun lien configuré.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Paramètres Généraux */}
                                    <section>
                                        <h3 style={{ fontSize: '1rem', color: 'var(--sn-black)', marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--sn-border)', paddingBottom: 'var(--sp-2)' }}>Paramètres Généraux</h3>
                                        <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: 'var(--sp-2)' }}>Nom du site</label>
                                                <input type="text" value={appearanceSettings.siteName || ''} onChange={(e) => handleSettingChange('siteName', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '0.95rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: 'var(--sp-2)' }}>Email de contact (Support)</label>
                                                <input type="email" value={appearanceSettings.contactEmail || ''} onChange={(e) => handleSettingChange('contactEmail', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '0.95rem' }} />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Tarification - Photos Numériques */}
                                    <section style={{ background: '#f8fafc', padding: 'var(--sp-6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border-light)' }}>
                                        <h3 style={{ fontSize: '1.1rem', color: 'var(--sn-black)', marginBottom: 'var(--sp-5)', borderBottom: '2px solid var(--sn-sand-pale)', paddingBottom: 'var(--sp-3)', display: 'inline-block' }}>
                                            Tarification - Photos Numériques
                                        </h3>

                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--sp-4)', color: 'var(--sn-gray-dark)' }}>Prix de base selon le format (FCFA)</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Web / Basse Résolution</label>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-3)', lineHeight: 1.3 }}>Réseaux sociaux, blogs personnels (1080px).</p>
                                                <input type="number" value={appearanceSettings.pricingDigitalWeb || 0} onChange={(e) => handleSettingChange('pricingDigitalWeb', Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '0.95rem', background: '#f9fafb' }} />
                                            </div>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Impression Haute Résolution</label>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-3)', lineHeight: 1.3 }}>Pour tirage personnel, qualité originale finale.</p>
                                                <input type="number" value={appearanceSettings.pricingDigitalPrint || 0} onChange={(e) => handleSettingChange('pricingDigitalPrint', Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '0.95rem', background: '#f9fafb' }} />
                                            </div>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Licence Commerciale</label>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-3)', lineHeight: 1.3 }}>Utilisation publicitaire, magazines, marques.</p>
                                                <input type="number" value={appearanceSettings.pricingDigitalCommercial || 0} onChange={(e) => handleSettingChange('pricingDigitalCommercial', Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '0.95rem', background: '#f9fafb' }} />
                                            </div>
                                        </div>

                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--sp-4)', color: 'var(--sn-gray-dark)' }}>Répartition des revenus (Numérique)</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--sp-5)' }}>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Part Photographe (%)</label>
                                                <input type="number" value={appearanceSettings.revenueShareDigitalPhoto || 0} onChange={(e) => handleSettingChange('revenueShareDigitalPhoto', Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '0.95rem' }} />
                                            </div>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)', color: 'var(--sn-gray)' }}>Frais de Plateforme (%)</label>
                                                <input type="number" value={100 - (appearanceSettings.revenueShareDigitalPhoto || 0)} disabled style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid transparent', fontSize: '0.95rem', background: '#f1f5f9', color: 'var(--sn-gray)' }} />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Tarification - Tirages (Prints) */}
                                    <section style={{ background: '#f8fafc', padding: 'var(--sp-6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sn-border-light)' }}>
                                        <h3 style={{ fontSize: '1.1rem', color: 'var(--sn-black)', marginBottom: 'var(--sp-5)', borderBottom: '2px solid var(--sn-sand-pale)', paddingBottom: 'var(--sp-3)', display: 'inline-block' }}>
                                            Tarification - Tirages Physiques (Prints)
                                        </h3>

                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--sp-4)', color: 'var(--sn-gray-dark)' }}>Tailles et Prix de base (FCFA)</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-5)', marginBottom: 'var(--sp-8)' }}>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Petit Format</label>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-3)', lineHeight: 1.3 }}>A4 / 20x30 cm.</p>
                                                <input type="number" value={appearanceSettings.pricingPrintSmall || 0} onChange={(e) => handleSettingChange('pricingPrintSmall', Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: '#f9fafb' }} />
                                            </div>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Moyen Format</label>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-3)', lineHeight: 1.3 }}>A3 / 30x45 cm.</p>
                                                <input type="number" value={appearanceSettings.pricingPrintMedium || 0} onChange={(e) => handleSettingChange('pricingPrintMedium', Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: '#f9fafb' }} />
                                            </div>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Grand Format</label>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-3)', lineHeight: 1.3 }}>A2 / 40x60 cm.</p>
                                                <input type="number" value={appearanceSettings.pricingPrintLarge || 0} onChange={(e) => handleSettingChange('pricingPrintLarge', Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: '#f9fafb' }} />
                                            </div>
                                        </div>

                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--sp-4)', color: 'var(--sn-gray-dark)' }}>Options d'encadrement (Surcoût en FCFA)</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-5)', marginBottom: 'var(--sp-8)' }}>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Cadre Standard</label>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-3)', lineHeight: 1.3 }}>Simple noir ou blanc.</p>
                                                <input type="number" value={appearanceSettings.pricingFrameStandard || 0} onChange={(e) => handleSettingChange('pricingFrameStandard', Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: '#f9fafb' }} />
                                            </div>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Cadre Premium</label>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-3)', lineHeight: 1.3 }}>Bois massif ou métal brossé.</p>
                                                <input type="number" value={appearanceSettings.pricingFramePremium || 0} onChange={(e) => handleSettingChange('pricingFramePremium', Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: '#f9fafb' }} />
                                            </div>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Passe-partout</label>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-3)', lineHeight: 1.3 }}>Marge blanche de protection.</p>
                                                <input type="number" value={appearanceSettings.pricingPassePartout || 0} onChange={(e) => handleSettingChange('pricingPassePartout', Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: '#f9fafb' }} />
                                            </div>
                                        </div>

                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--sp-4)', color: 'var(--sn-gray-dark)' }}>Répartition des revenus (Tirages nets)</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--sp-5)' }}>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Frais Imprimeur & Logistique (%)</label>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-3)', lineHeight: 1.3 }}>Déduction estimée avant partage.</p>
                                                <input type="number" value={appearanceSettings.revenueSharePrintPrinter || 0} onChange={(e) => handleSettingChange('revenueSharePrintPrinter', Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }} />
                                            </div>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Part Photographe (%)</label>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-3)', lineHeight: 1.3 }}>Sur le bénéfice net de la vente.</p>
                                                <input type="number" value={appearanceSettings.revenueSharePrintPhoto || 0} onChange={(e) => handleSettingChange('revenueSharePrintPhoto', Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }} />
                                            </div>
                                            <div style={{ background: 'white', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)', color: 'var(--sn-gray)' }}>Part Plateforme (%)</label>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--sn-gray)', marginBottom: 'var(--sp-3)', lineHeight: 1.3 }}>Restant alloué à la plateforme.</p>
                                                <input type="number" value={100 - (appearanceSettings.revenueSharePrintPrinter || 0) - (appearanceSettings.revenueSharePrintPhoto || 0)} disabled style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid transparent', background: '#f1f5f9', color: 'var(--sn-gray)' }} />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Paiements */}
                                    <section>
                                        <h3 style={{ fontSize: '1rem', color: 'var(--sn-black)', marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--sn-border)', paddingBottom: 'var(--sp-2)' }}>Passerelles de Paiement</h3>
                                        <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: 'var(--sp-2)' }}>Clé API Publique PayDunya (Test)</label>
                                                <input type="text" defaultValue="pk_test_xxxxxxxxxxxxxxxxx" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '0.95rem', fontFamily: 'monospace' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: 'var(--sp-2)' }}>Clé API Publique Stripe (Test)</label>
                                                <input type="text" defaultValue="pk_test_51xxxxxxxxxxxxxxx" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', fontSize: '0.95rem', fontFamily: 'monospace' }} />
                                            </div>
                                        </div>
                                    </section>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--sp-4)' }}>
                                        <button className="btn-primary" onClick={async () => {
                                            try {
                                                await updateAppearanceSettings(appearanceSettings)
                                                alert("Paramètres mis à jour avec succès via Firestore !")
                                            } catch (error) {
                                                console.error("Erreur saving settings:", error)
                                                alert("Une erreur est survenue")
                                            }
                                        }}>
                                            <Check size={18} style={{ display: 'inline', marginRight: '8px' }} /> Enregistrer les modifications
                                        </button>
                                    </div>

                                </div>
                            </div>
                        )}

                    </div>
                </div>
                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', padding: 'var(--sp-8)', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{editingWalk ? 'Modifier la Randonnée' : 'Nouvelle Randonnée'}</h2>
                                <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sn-gray)' }}>
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSaveWalk} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Titre</label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleFormChange} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-4)' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Date</label>
                                        <input required type="date" name="date" value={formData.date} onChange={handleFormChange} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Heure de début</label>
                                        <input required type="time" name="startTime" value={formData.startTime} onChange={handleFormChange} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Heure de fin</label>
                                        <input required type="time" name="endTime" value={formData.endTime} onChange={handleFormChange} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--sp-4)' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Lieu</label>
                                        <input required type="text" name="location" value={formData.location} onChange={handleFormChange} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Max. Participants</label>
                                        <input required type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleFormChange} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Catégorie</label>
                                    <select name="category" value={formData.category} onChange={handleFormChange} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: 'white' }}>
                                        <option value="photowalk">Randonnée (Photowalk)</option>
                                        <option value="exhibition">Exposition</option>
                                        <option value="workshop">Workshop</option>
                                        <option value="masterclass">Masterclass</option>
                                        <option value="other">Autre</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Guide / Photographe (Optionnel)</label>
                                    <select name="photographerId" value={formData.photographerId} onChange={handleFormChange} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: 'white' }}>
                                        <option value="">-- Aucun guide spécifique --</option>
                                        {usersList.filter(u => u.role === 'Membre').map(u => (
                                            <option key={u.id || u.uid} value={u.uid || u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Image de couverture</label>
                                    <input type="file" name="cover" accept="image/*" onChange={handleFormChange} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', background: 'white' }} />
                                    {formData.cover && <img src={formData.cover} alt="Preview" style={{ marginTop: 'var(--sp-2)', height: '100px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Description</label>
                                    <textarea required name="description" value={formData.description} onChange={handleFormChange} rows={4} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)', resize: 'vertical' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-4)', marginTop: 'var(--sp-2)' }}>
                                    <button type="button" onClick={closeModal} className="btn-secondary" style={{ padding: '10px 20px' }}>Annuler</button>
                                    <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>{editingWalk ? 'Enregistrer' : 'Créer'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add User Modal */}
                {isUserModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', padding: 'var(--sp-8)', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Nouvel Utilisateur</h2>
                                <button onClick={() => setIsUserModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sn-gray)' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Nom Complet</label>
                                    <input type="text" name="name" value={userFormData.name} onChange={handleUserFormChange} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Adresse Email</label>
                                    <input type="email" name="email" value={userFormData.email} onChange={handleUserFormChange} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Rôle</label>
                                        <select name="role" value={userFormData.role} onChange={handleUserFormChange} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                            <option value="Administrateur">Administrateur</option>
                                            <option value="Contributeur">Contributeur</option>
                                            <option value="Membre">Membre</option>
                                            <option value="Utilisateur">Utilisateur</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Statut</label>
                                        <select name="status" value={userFormData.status} onChange={handleUserFormChange} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sn-border)' }}>
                                            <option value="Actif">Actif</option>
                                            <option value="Inactif">Inactif</option>
                                            <option value="Banni">Banni</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
                                    <button type="button" onClick={() => setIsUserModalOpen(false)} className="btn-secondary" style={{ padding: '10px 20px' }}>Annuler</button>
                                    <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Enregistrer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
