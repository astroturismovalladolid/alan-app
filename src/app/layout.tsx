
'use client';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { LanguageProvider } from '@/context/language-context';
import { AuthProvider } from '@/context/auth-context';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';


// export const metadata: Metadata = {
//   title: 'ALAN - Anti-Light-Pollution Action Network',
//   description: 'Upload, view, and discuss images of light pollution.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.className = theme;
  }, []);

  return (
    <html lang="en">
      <head>
        <title>ALAN - Anti-Light-Pollution Action Network</title>
        <meta name="description" content="Upload, view, and discuss images of light pollution." />
      </head>
      <body>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster />
            <FirebaseErrorListener />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
