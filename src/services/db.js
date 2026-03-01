import { db, storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore'
import { photographers as mockPhotographers, walks as mockWalks, bankImages as mockBankImages, events as mockEvents } from '../data/mockData'

// ---------------------------------------------------------------------------
// Helper: Wrap any promise with a timeout. On timeout/failure, calls onFallback
// ---------------------------------------------------------------------------
const withFallback = (promise, fallback, timeoutMs = 5000) => {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), timeoutMs)
    );
    return Promise.race([promise, timeout]).catch((err) => {
        console.warn('[db] Firestore unavailable, using fallback:', err.message);
        return typeof fallback === 'function' ? fallback() : fallback;
    });
};

// Helper to format Firestore snapshot
const formatResponse = (snapshot) => {
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// --- USERS ---
const usersCollection = collection(db, 'users')

export const getUsers = async () => {
    const fallback = () => mockPhotographers.map((p, i) => ({
        id: `mock-${i}`,
        name: p.name,
        slug: p.slug,
        email: `${p.slug}@example.com`,
        role: p.isMember ? 'Membre' : 'Contributeur',
        avatar: p.avatar,
        cover: p.cover,
        bio: p.bio,
        location: p.location,
        speciality: p.speciality,
        featured: p.featured,
        isMember: p.isMember || false,
        social: p.social
    }));
    return withFallback(
        getDocs(usersCollection).then(formatResponse),
        fallback
    );
}

export const getUserById = async (id) => {
    return withFallback(
        getDoc(doc(db, 'users', id)).then(snapshot =>
            snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
        ),
        null,
        4000
    );
}

export const getUserBySlug = async (slug) => {
    const fallback = () => {
        const p = mockPhotographers.find(p => p.slug === slug);
        return p ? { id: p.slug, ...p } : null;
    };
    return withFallback(
        getDocs(query(usersCollection, where('slug', '==', slug)))
            .then(snapshot => {
                const users = formatResponse(snapshot);
                return users.length > 0 ? users[0] : null;
            }),
        fallback
    );
}

export const addUser = async (userData, uid = null) => {
    if (uid) {
        const docRef = doc(db, 'users', uid)
        await setDoc(docRef, userData)
        return { id: uid, ...userData }
    } else {
        const docRef = await addDoc(usersCollection, userData)
        return { id: docRef.id, ...userData }
    }
}

export const updateUser = async (id, data) => {
    const docRef = doc(db, 'users', id)
    await updateDoc(docRef, data)
    return { id, ...data }
}

export const deleteUser = async (id) => {
    const docRef = doc(db, 'users', id)
    await deleteDoc(docRef)
}


// --- WALKS / EVENTS ---
const walksCollection = collection(db, 'walks')

export const getWalks = async () => {
    const fallback = () => [...mockWalks, ...mockEvents].map((w, i) => ({ id: `mock-walk-${i}`, ...w }));
    return withFallback(
        getDocs(query(walksCollection, orderBy('date', 'desc'))).then(formatResponse),
        fallback
    );
}

export const getWalkBySlug = async (slug) => {
    const fallback = () => {
        const all = [...mockWalks, ...mockEvents];
        const w = all.find(w => w.slug === slug);
        return w ? { id: w.slug, ...w } : null;
    };
    return withFallback(
        getDocs(query(walksCollection, where('slug', '==', slug)))
            .then(snapshot => {
                const walks = formatResponse(snapshot);
                return walks.length > 0 ? walks[0] : null;
            }),
        fallback,
        10000
    );
}

export const addWalk = async (walkData) => {
    const docRef = await addDoc(walksCollection, walkData)
    return { id: docRef.id, ...walkData }
}

export const updateWalk = async (id, data) => {
    const docRef = doc(db, 'walks', id)
    await updateDoc(docRef, data)
    return { id, ...data }
}

export const deleteWalk = async (id) => {
    const docRef = doc(db, 'walks', id)
    await deleteDoc(docRef)
}


// --- BANK IMAGES (PORTFOLIO) ---
const imagesCollection = collection(db, 'bankImages')

export const getBankImages = async () => {
    const fallback = () => mockBankImages.map((img, i) => ({ id: `mock-img-${i}`, ...img }));
    return withFallback(
        getDocs(imagesCollection).then(formatResponse),
        fallback
    );
}

export const getImageById = async (id) => {
    const fallback = () => {
        const img = mockBankImages.find(img => img.id === id);
        return img || null;
    };
    return withFallback(
        getDoc(doc(db, 'bankImages', id)).then(snapshot =>
            snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
        ),
        fallback
    );
}

export const getImagesByPhotographer = async (photographerId) => {
    const fallback = () => mockBankImages.filter(img => img.photographerId === photographerId);
    return withFallback(
        getDocs(query(imagesCollection, where('photographerId', '==', photographerId))).then(formatResponse),
        fallback
    );
}

export const addImage = async (imageData) => {
    const docRef = await addDoc(imagesCollection, imageData)
    return { id: docRef.id, ...imageData }
}

export const updateImage = async (id, data) => {
    const docRef = doc(db, 'bankImages', id)
    await updateDoc(docRef, data)
    return { id, ...data }
}

export const deleteImage = async (id) => {
    const docRef = doc(db, 'bankImages', id)
    await deleteDoc(docRef)
}

export const getPendingImages = async () => {
    const fallback = () => [];
    return withFallback(
        getDocs(query(imagesCollection, where('status', '==', 'pending'))).then(formatResponse),
        fallback
    );
}

export const approveImage = async (id) => {
    const docRef = doc(db, 'bankImages', id)
    await updateDoc(docRef, { status: 'approved' })
}

export const rejectImage = async (id) => {
    const docRef = doc(db, 'bankImages', id)
    await updateDoc(docRef, { status: 'rejected' })
}

// --- APPEARANCE SETTINGS ---
export const getAppearanceSettings = async () => {
    return withFallback(
        getDoc(doc(db, 'settings', 'appearance')).then(snapshot =>
            snapshot.exists() ? snapshot.data() : null
        ),
        null
    );
}

export const updateAppearanceSettings = async (data) => {
    const docRef = doc(db, 'settings', 'appearance')
    await setDoc(docRef, data, { merge: true })
    return data
}

// --- STORAGE ---
export const uploadImageToStorage = async (file, path = 'uploads') => {
    if (!file) return null
    if (!storage) {
        console.warn('[db] Firebase Storage not configured — upload skipped')
        throw new Error("Firebase Storage n'est pas encore configuré. Veuillez activer Storage dans la console Firebase.")
    }
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    return url
}


// --- SEEDING (Dev Only) ---
export const seedDatabaseIfEmpty = async () => {
    try {
        const usersSnapshot = await getDocs(usersCollection)
        if (usersSnapshot.empty) {
            console.log('Seeding Users...')
            for (const p of mockPhotographers) {
                await addDoc(usersCollection, {
                    name: p.name,
                    slug: p.slug,
                    email: `${p.slug}@example.com`,
                    role: p.isMember ? 'Membre' : 'Contributeur',
                    status: 'Actif',
                    bio: p.bio,
                    location: p.location,
                    avatar: p.avatar,
                    cover: p.cover,
                    social: p.social,
                    speciality: p.speciality,
                    featured: p.featured,
                    isMember: p.isMember || false
                })
            }
        }

        const walksSnapshot = await getDocs(walksCollection)
        if (walksSnapshot.empty) {
            console.log('Seeding Walks/Events...')
            const allItems = [...mockWalks, ...mockEvents]
            for (const item of allItems) {
                await addDoc(walksCollection, {
                    title: item.title,
                    slug: item.slug,
                    date: item.date,
                    time: item.time,
                    description: item.description,
                    location: item.location,
                    coordinates: item.coordinates || null,
                    cover: item.cover,
                    status: item.status || 'upcoming',
                    participants: item.participants || 0,
                    maxParticipants: item.maxParticipants || 0,
                    photographerId: item.photographerId || null,
                    photos: item.photos || [],
                    category: item.type || 'photowalk'
                })
            }
        }

        const imagesSnapshot = await getDocs(imagesCollection)
        if (imagesSnapshot.empty) {
            console.log('Seeding Bank Images...')
            for (const img of mockBankImages) {
                await addDoc(imagesCollection, {
                    title: img.title,
                    url: img.url,
                    thumbnailUrl: img.thumbnailUrl,
                    photographerId: img.photographerId,
                    photographer: img.photographer,
                    category: img.category,
                    location: img.location,
                    orientation: img.orientation,
                    license: img.license,
                    price: img.price,
                    resolution: img.resolution,
                    status: 'approved',
                    createdAt: new Date().toISOString()
                })
            }
        }
    } catch (error) {
        console.error("Error seeding database:", error)
    }
}
