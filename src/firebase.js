import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    projectId: "sunu-nataal-web",
    appId: "1:205370669888:web:e82e8ec86b73accd06d8a5",
    storageBucket: "sunu-nataal-web.firebasestorage.app",
    apiKey: "AIzaSyCUqH5kBnvyBN1O8DePZoyvU-d1_-_Mvb4",
    authDomain: "sunu-nataal-web.firebaseapp.com",
    messagingSenderId: "205370669888",
};

// Initialize or get existing Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Firestore with modern persistent cache configuration
let firestore;
try {
    firestore = initializeFirestore(app, {
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
        })
    });
} catch (e) {
    firestore = getFirestore(app);
}

export const db = firestore;
// Initialize Storage — may not be available if the bucket hasn't been created yet
let storage = null;
try {
    storage = getStorage(app);
} catch (e) {
    console.warn('[firebase] Storage not available:', e.message);
}

export { storage };

export default app;
