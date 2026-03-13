'use client';

/**
 * Authentication Provider Component
 *
 * Provides auth context throughout the app with:
 * - Current user state
 * - Loading state
 * - Google sign-in/sign-out methods
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import type { User, AuthContextValue } from '@/types';

// Create context with default values
const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
});

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle redirect result on page load
  useEffect(() => {
    if (!auth) return;

    getRedirectResult(auth).catch((error) => {
      console.error('Redirect sign-in error:', error);
    });
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    // Skip if Firebase is not initialized (SSR or missing config)
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && db) {
        // Fetch or create user profile in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data() as User);
        } else {
          // Create new user profile
          const newUser = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Anonymous',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, newUser);
          // Fetch the created document to get the actual timestamp
          const createdSnap = await getDoc(userRef);
          setUser(createdSnap.data() as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google (tries popup first, falls back to redirect)
  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      console.error('Firebase not initialized');
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      // If popup is blocked, fall back to redirect
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/popup-blocked' ||
          firebaseError.code === 'auth/popup-closed-by-user') {
        console.log('Popup blocked, using redirect...');
        await signInWithRedirect(auth, googleProvider);
      } else {
        console.error('Error signing in with Google:', error);
        throw error;
      }
    }
  };

  // Sign out
  const signOut = async () => {
    if (!auth) {
      console.error('Firebase not initialized');
      return;
    }
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<User>) => {
    if (!user || !db) {
      console.error('User not logged in or Firebase not initialized');
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, data, { merge: true });
      // Update local state
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
