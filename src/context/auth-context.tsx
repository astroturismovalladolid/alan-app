
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { SecurityRuleContext } from '@/firebase/errors';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        const userData = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp(),
        };

        if (!userDoc.exists()) {
            // New user, create the document with createdAt
             setDoc(userRef, {
                ...userData,
                createdAt: serverTimestamp(),
            }).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: userRef.path,
                    operation: 'create',
                    requestResourceData: userData,
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
            });
        } else {
            // Existing user, just update lastLogin
             setDoc(userRef, {
                lastLogin: serverTimestamp(),
            }, { merge: true }).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: userRef.path,
                    operation: 'update',
                    requestResourceData: { lastLogin: new Date() },
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
            });
        }
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {loading ? (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
