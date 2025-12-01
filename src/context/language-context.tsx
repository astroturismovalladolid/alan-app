
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-context';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';

type Language = 'en' | 'es' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = { en, es, fr };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const { user } = useAuth();

  // Load language preference from Firestore when user logs in
  useEffect(() => {
    const loadLanguagePreference = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const savedLanguage = userData.language as Language | undefined;

            if (savedLanguage && ['en', 'es', 'fr'].includes(savedLanguage)) {
              setLanguageState(savedLanguage);
              localStorage.setItem('language', savedLanguage);
            }
          }
        } catch (error) {
          console.warn('Failed to load language preference from Firestore:', error);
          // Fallback to localStorage
          const savedLanguage = localStorage.getItem('language') as Language | null;
          if (savedLanguage && ['en', 'es', 'fr'].includes(savedLanguage)) {
            setLanguageState(savedLanguage);
          }
        }
      } else {
        // User logged out, fallback to localStorage
        const savedLanguage = localStorage.getItem('language') as Language | null;
        if (savedLanguage && ['en', 'es', 'fr'].includes(savedLanguage)) {
          setLanguageState(savedLanguage);
        }
      }
    };

    loadLanguagePreference();
  }, [user]);

  const setLanguage = async (lang: Language) => {
    // Update local state and localStorage immediately
    localStorage.setItem('language', lang);
    setLanguageState(lang);

    // Sync to Firestore if user is logged in
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { language: lang }, { merge: true });
      } catch (error) {
        console.warn('Failed to save language preference to Firestore:', error);
      }
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[Language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
