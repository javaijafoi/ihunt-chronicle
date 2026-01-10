import { useState, useEffect, useCallback } from 'react';
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Create/update user profile in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            displayName: firebaseUser.displayName || 'Caçador',
            photoURL: firebaseUser.photoURL,
            isAnonymous: firebaseUser.isAnonymous,
            email: firebaseUser.email,
            createdAt: serverTimestamp(),
          });
        }

        setUserProfile({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Caçador',
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous,
        });
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error?.code === 'auth/unauthorized-domain') {
        throw new Error('Domínio não autorizado. Adicione este domínio no Firebase Console');
      }
      throw error;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error('Email sign in error:', error);
      throw error;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });

      // Force profile update in Firestore immediately
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        displayName: name,
        photoURL: null,
        isAnonymous: false,
        email: email,
        createdAt: serverTimestamp(),
      });

    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  return {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isAuthenticated: !!user,
  };
}
