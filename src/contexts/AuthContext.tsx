import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

export type UserRole = 'admin' | 'editor' | 'viewer';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoAdmin: () => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user role from firestore or default
  const fetchUserProfile = async (firebaseUser: User) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || data.displayName || 'संपादक',
          photoURL: firebaseUser.photoURL || data.photoURL,
          role: data.role || 'admin', // Default to admin for registered users on the news portal
        });
      } else {
        // Create user document with admin role by default
        const newProf: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'कबीरा मुख्य संपादक',
          photoURL: firebaseUser.photoURL || null,
          role: 'admin',
        };
        await setDoc(userDocRef, newProf, { merge: true });
        setProfile(newProf);
      }
    } catch {
      // Local fallback for offline/restricted rules
      setProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'कबीरा एडमिनिस्ट्रेटर',
        photoURL: firebaseUser.photoURL,
        role: 'admin',
      });
    }
  };

  useEffect(() => {
    // Check if demo admin mode was previously activated
    const demoAdmin = localStorage.getItem('kabira_demo_admin');
    if (demoAdmin) {
      try {
        const parsed = JSON.parse(demoAdmin);
        setProfile(parsed);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem('kabira_demo_admin');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      await fetchUserProfile(res.user);
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await fetchUserProfile(res.user);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await fetchUserProfile(res.user);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoAdmin = () => {
    const demoAdminProfile: UserProfile = {
      uid: 'demo-admin-kabira',
      email: 'admin@kabiranews.com',
      displayName: 'कबीरा प्रधान संपादक (Admin)',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      role: 'admin',
    };
    localStorage.setItem('kabira_demo_admin', JSON.stringify(demoAdminProfile));
    setProfile(demoAdminProfile);
  };

  const logout = async () => {
    localStorage.removeItem('kabira_demo_admin');
    setProfile(null);
    setUser(null);
    try {
      await signOut(auth);
    } catch {
      // Ignored
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const role: UserRole = profile?.role || 'viewer';
  const isAdmin = role === 'admin' || role === 'editor';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        loading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        loginAsDemoAdmin,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
