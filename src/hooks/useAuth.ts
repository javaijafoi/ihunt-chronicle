import { useState, useEffect, useCallback } from 'react';
import { 
  User,
  signInWithPopup, 
  signInAnonymously as firebaseSignInAnonymously,
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
            displayName: firebaseUser.displayName || 'Caçador Anônimo',
            photoURL: firebaseUser.photoURL,
            isAnonymous: firebaseUser.isAnonymous,
            createdAt: serverTimestamp(),
          });
        }
        
        setUserProfile({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Caçador Anônimo',
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
      // Handle unauthorized domain error
      if (error?.code === 'auth/unauthorized-domain') {
        throw new Error('Domínio não autorizado. Adicione este domínio no Firebase Console → Authentication → Settings → Authorized domains');
      }
      throw error;
    }
  }, []);

  const signInAnonymously = useCallback(async () => {
    try {
      await firebaseSignInAnonymously(auth);
    } catch (error: any) {
      console.error('Anonymous sign in error:', error);
      if (error?.code === 'auth/unauthorized-domain') {
        throw new Error('Domínio não autorizado. Adicione este domínio no Firebase Console');
      }
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
    signInAnonymously,
    signOut,
    isAuthenticated: !!user,
  };
}
