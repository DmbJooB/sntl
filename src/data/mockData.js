// Sunu Nataal – Mock Data
// Sample photographers, walks, events, and images for the prototype

export const photographers = [
    {
        id: 1,
        name: 'Amadou Diallo',
        slug: 'amadou-diallo',
        bio: 'Photographe documentaire basé à Dakar. Passionné par les scènes de rue et la vie quotidienne sénégalaise.',
        location: 'Dakar, Sénégal',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        cover: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&h=400&fit=crop',
        social: { instagram: '@amadou_photo', website: 'amadoudiallo.com' },
        speciality: 'Street Photography',
        walksCount: 12,
        photosCount: 234,
        featured: true,
        isMember: true
    },
    {
        id: 2,
        name: 'Fatou Sow',
        slug: 'fatou-sow',
        bio: 'Artiste visuelle et portraitiste. Capture l\'essence de la culture sénégalaise à travers ses portraits lumineux.',
        location: 'Saint-Louis, Sénégal',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face',
        cover: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=1200&h=400&fit=crop',
        social: { instagram: '@fatou_portraits' },
        speciality: 'Portraits',
        walksCount: 8,
        photosCount: 156,
        featured: true
    },
    {
        id: 3,
        name: 'Moussa Ndiaye',
        slug: 'moussa-ndiaye',
        bio: 'Photographe paysagiste capturant les couleurs vibrantes du Sénégal, du Lac Rose aux plages de Casamance.',
        location: 'Thiès, Sénégal',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
        cover: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=400&fit=crop',
        social: { instagram: '@moussa_landscapes' },
        speciality: 'Paysages',
        walksCount: 15,
        photosCount: 312,
        featured: true,
        isMember: true
    },
    {
        id: 4,
        name: 'Aïssatou Ba',
        slug: 'aissatou-ba',
        bio: 'Photographe d\'architecture et urbaine. Explore les contrastes architecturaux entre tradition et modernité à Dakar.',
        location: 'Dakar, Sénégal',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
        cover: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=400&fit=crop',
        social: { instagram: '@aissatou_archi' },
        speciality: 'Architecture',
        walksCount: 6,
        photosCount: 89,
        featured: false
    },
    {
        id: 5,
        name: 'Ibrahima Fall',
        slug: 'ibrahima-fall',
        bio: 'Photojournaliste indépendant couvrant les événements culturels et festivals au Sénégal et en Afrique de l\'Ouest.',
        location: 'Dakar, Sénégal',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        cover: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&h=400&fit=crop',
        social: { instagram: '@ibrahima_journal' },
        speciality: 'Photojournalisme',
        walksCount: 20,
        photosCount: 478,
        featured: true
    },
    {
        id: 6,
        name: 'Mariama Diop',
        slug: 'mariama-diop',
        bio: 'Spécialisée en photographie culinaire et culturelle. Met en lumière la richesse gastronomique sénégalaise.',
        location: 'Dakar, Sénégal',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
        cover: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop',
        social: { instagram: '@mariama_food' },
        speciality: 'Food & Culture',
        walksCount: 9,
        photosCount: 201,
        featured: false
    }
];

export const walks = [
    {
        id: 1,
        title: 'Les Couleurs de la Médina',
        slug: 'couleurs-de-la-medina',
        date: '2026-03-08',
        time: '08:00',
        description: 'Explorez les ruelles colorées de la Médina de Dakar. Capturez la vie quotidienne, les marchés animés et l\'architecture coloniale mêlée aux traditions locales.',
        location: 'Médina, Dakar',
        coordinates: [14.6937, -17.4441],
        cover: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&h=500&fit=crop',
        status: 'upcoming',
        participants: 18,
        maxParticipants: 25,
        photographerId: 1,
        photos: []
    },
    {
        id: 2,
        title: 'Gorée – Mémoire & Lumière',
        slug: 'goree-memoire-lumiere',
        date: '2026-03-22',
        time: '09:00',
        description: 'Une randonnée photo sur l\'île de Gorée, classée au patrimoine mondial de l\'UNESCO. Architecture pastel, mer turquoise et histoire émouvante.',
        location: 'Île de Gorée, Dakar',
        coordinates: [14.6667, -17.3986],
        cover: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=800&h=500&fit=crop',
        status: 'upcoming',
        participants: 12,
        maxParticipants: 20,
        photographerId: 2,
        photos: []
    },
    {
        id: 3,
        title: 'Lac Rose au Crépuscule',
        slug: 'lac-rose-crepuscule',
        date: '2026-02-10',
        time: '16:00',
        description: 'Capturez les teintes roses et dorées du Lac Retba au coucher du soleil. Scènes de récolteurs de sel et paysages surréalistes.',
        location: 'Lac Rose, Rufisque',
        coordinates: [14.8400, -17.2333],
        cover: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=500&fit=crop',
        status: 'past',
        participants: 22,
        maxParticipants: 25,
        photographerId: 3,
        photos: [
            { id: 101, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop', photographer: 'Moussa Ndiaye' },
            { id: 102, url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=800&fit=crop', photographer: 'Amadou Diallo' },
            { id: 103, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop', photographer: 'Fatou Sow' },
            { id: 104, url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop', photographer: 'Aïssatou Ba' },
            { id: 105, url: 'https://images.unsplash.com/photo-1465056836900-8f1e940f1904?w=600&h=900&fit=crop', photographer: 'Ibrahima Fall' },
            { id: 106, url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=500&fit=crop', photographer: 'Mariama Diop' }
        ]
    },
    {
        id: 4,
        title: 'Saint-Louis – La Ville aux Mille Couleurs',
        slug: 'saint-louis-mille-couleurs',
        date: '2026-01-25',
        time: '07:30',
        description: 'Parcourez les rues historiques de Saint-Louis, entre pirogues colorées, ponts emblématiques et jazz qui résonne dans les rues.',
        location: 'Saint-Louis, Sénégal',
        coordinates: [16.0326, -16.4818],
        cover: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&h=500&fit=crop',
        status: 'past',
        participants: 15,
        maxParticipants: 20,
        photographerId: 5,
        photos: [
            { id: 201, url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=400&fit=crop', photographer: 'Ibrahima Fall' },
            { id: 202, url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=800&fit=crop', photographer: 'Fatou Sow' },
            { id: 203, url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop', photographer: 'Moussa Ndiaye' },
            { id: 204, url: 'https://images.unsplash.com/photo-1523978591478-c753949ff840?w=800&h=600&fit=crop', photographer: 'Amadou Diallo' }
        ]
    }
];

export const events = [
    {
        id: 1,
        title: 'Exposition "Regards du Sénégal"',
        slug: 'exposition-regards-senegal',
        type: 'exhibition',
        date: '2026-04-05',
        time: '18:00',
        endDate: '2026-04-20',
        description: 'Une exposition collective présentant les meilleures images des randonnées photo de l\'année. Vernissage le 5 avril avec les photographes.',
        location: 'Galerie Arte, Dakar Plateau',
        coordinates: [14.6928, -17.4467],
        cover: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop'
    },
    {
        id: 2,
        title: 'Workshop Lightroom & Retouche',
        slug: 'workshop-lightroom-retouche',
        type: 'workshop',
        date: '2026-03-15',
        time: '14:00',
        description: 'Apprenez les techniques de retouche photo professionnelle avec Lightroom. Session pratique avec vos propres images.',
        location: 'Co-working Jokko, Mermoz, Dakar',
        coordinates: [14.7167, -17.4667],
        cover: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop'
    },
    ...walks.filter(w => w.status === 'upcoming').map(w => ({
        id: w.id + 100,
        title: w.title,
        slug: w.slug,
        type: 'walk',
        date: w.date,
        time: w.time,
        description: w.description,
        location: w.location,
        coordinates: w.coordinates,
        cover: w.cover
    }))
];

export const bankImages = [
    {
        id: 1,
        title: 'Pêcheurs de Kayar',
        url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=300&fit=crop',
        photographerId: 1,
        photographer: 'Amadou Diallo',
        category: 'Vie quotidienne',
        location: 'Kayar, Sénégal',
        orientation: 'landscape',
        license: 'commercial',
        price: 'premium',
        resolution: '6000 × 4000'
    },
    {
        id: 2,
        title: 'Baobab solitaire',
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
        photographerId: 3,
        photographer: 'Moussa Ndiaye',
        category: 'Paysages',
        location: 'Thiès, Sénégal',
        orientation: 'landscape',
        license: 'editorial',
        price: 'free',
        resolution: '5000 × 3333'
    },
    {
        id: 3,
        title: 'Portrait Femme Peulh',
        url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=900&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=450&fit=crop',
        photographerId: 2,
        photographer: 'Fatou Sow',
        category: 'Portraits',
        location: 'Podor, Sénégal',
        orientation: 'portrait',
        license: 'commercial',
        price: 'premium',
        resolution: '4000 × 6000'
    },
    {
        id: 4,
        title: 'Mosquée de Touba',
        url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
        photographerId: 4,
        photographer: 'Aïssatou Ba',
        category: 'Architecture',
        location: 'Touba, Sénégal',
        orientation: 'landscape',
        license: 'editorial',
        price: 'free',
        resolution: '5500 × 3667'
    },
    {
        id: 5,
        title: 'Festival de Jazz de Saint-Louis',
        url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&h=300&fit=crop',
        photographerId: 5,
        photographer: 'Ibrahima Fall',
        category: 'Événements',
        location: 'Saint-Louis, Sénégal',
        orientation: 'landscape',
        license: 'editorial',
        price: 'premium',
        resolution: '6000 × 4000'
    },
    {
        id: 6,
        title: 'Thiéboudienne traditionnel',
        url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        photographerId: 6,
        photographer: 'Mariama Diop',
        category: 'Gastronomie',
        location: 'Dakar, Sénégal',
        orientation: 'landscape',
        license: 'commercial',
        price: 'free',
        resolution: '4800 × 3200'
    },
    {
        id: 7,
        title: 'Coucher de soleil sur la Corniche',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        photographerId: 3,
        photographer: 'Moussa Ndiaye',
        category: 'Paysages',
        location: 'Dakar, Sénégal',
        orientation: 'landscape',
        license: 'commercial',
        price: 'premium',
        resolution: '6000 × 4000'
    },
    {
        id: 8,
        title: 'Marché Sandaga',
        url: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400&h=300&fit=crop',
        photographerId: 1,
        photographer: 'Amadou Diallo',
        category: 'Vie quotidienne',
        location: 'Dakar, Sénégal',
        orientation: 'landscape',
        license: 'editorial',
        price: 'free',
        resolution: '5000 × 3333'
    }
];

export const feedImages = [
    ...bankImages.map((img, i) => ({ ...img, id: 500 + i, likes: Math.floor(Math.random() * 200) + 20, timestamp: `Il y a ${Math.floor(Math.random() * 48) + 1}h` })),
    ...(walks[2]?.photos || []).map((p, i) => ({
        id: 600 + i,
        title: `Lac Rose #${i + 1}`,
        url: p.url,
        thumbnailUrl: p.url,
        photographer: p.photographer,
        category: 'Randonnée',
        location: 'Lac Rose',
        likes: Math.floor(Math.random() * 150) + 10,
        timestamp: `Il y a ${Math.floor(Math.random() * 72) + 1}h`
    })),
    ...(walks[3]?.photos || []).map((p, i) => ({
        id: 700 + i,
        title: `Saint-Louis #${i + 1}`,
        url: p.url,
        thumbnailUrl: p.url,
        photographer: p.photographer,
        category: 'Randonnée',
        location: 'Saint-Louis',
        likes: Math.floor(Math.random() * 100) + 5,
        timestamp: `Il y a ${Math.floor(Math.random() * 120) + 1}h`
    }))
];
