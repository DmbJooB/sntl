import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getUserById } from '../services/db';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    // loading is only true until we know whether the user is logged in or not.
    // It does NOT wait for Firestore data — that happens in the background.
    const [loading, setLoading] = useState(true);

    async function signup(email, password, role = 'Utilisateur') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const newUserData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            role: role,
            status: 'Actif',
            createdAt: new Date().toISOString()
        };
        try {
            await setDoc(doc(db, 'users', user.uid), newUserData, { merge: true });
        } catch (error) {
            console.warn("Could not save initial user data:", error);
        }
        return userCredential;
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // 1. Set the user immediately so the app can render.
                //    We use role 'Utilisateur' as a temporary default.
                setCurrentUser({ ...user, role: 'Utilisateur' });

                // 2. Fetch the actual role and claims in the background.
                //    The app is already un-blocked by this point.
                const fetchRole = async () => {
                    try {
                        const [tokenResult, userDoc] = await Promise.all([
                            user.getIdTokenResult(),
                            getDoc(doc(db, 'users', user.uid)).catch(() => null)
                        ]);

                        const isAdminClaim = tokenResult.claims.admin === true;
                        const role = isAdminClaim
                            ? 'Administrateur'
                            : (userDoc?.exists() ? (userDoc.data().role || 'Utilisateur') : 'Utilisateur');

                        // Auto-create the Firestore document if it doesn't exist
                        // (especially important for admin users on first login)
                        if (!userDoc?.exists()) {
                            const newUserData = {
                                uid: user.uid,
                                email: user.email,
                                name: user.displayName || user.email.split('@')[0],
                                role: isAdminClaim ? 'Administrateur' : 'Utilisateur',
                                status: 'Actif',
                                createdAt: new Date().toISOString()
                            };
                            // Attempt to create doc (will succeed if Firestore rules allow it)
                            setDoc(doc(db, 'users', user.uid), newUserData, { merge: true })
                                .catch(e => console.warn('[auth] Could not auto-create user doc:', e.message));
                        } else if (isAdminClaim && userDoc.data().role !== 'Administrateur') {
                            // Sync admin role from claim to Firestore doc
                            setDoc(doc(db, 'users', user.uid), { role: 'Administrateur' }, { merge: true })
                                .catch(e => console.warn('[auth] Could not sync admin role:', e.message));
                        }

                        setCurrentUser(prev => prev ? { ...prev, role } : prev);
                    } catch (error) {
                        // Non-critical: fallback role already set above
                        console.warn("Could not fetch full user profile:", error.message);
                    }
                };
                fetchRole();
            } else {
                setCurrentUser(null);
            }
            // Always unblock the app once auth state is known
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f9f9f9' }}>
                    <div style={{
                        width: '40px', height: '40px', border: '4px solid #eaeaea', borderTop: '4px solid #c8a96e', borderRadius: '50%', animation: 'spin 1s linear infinite'
                    }} />
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}
