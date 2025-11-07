'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * A client component that listens for Firestore permission errors
 * and throws them to be caught by the Next.js error overlay.
 * This is for development purposes only and should not be used in production.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // Throw the error so Next.js can catch it and show the overlay
      // in development mode.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // This component does not render anything.
  return null;
}