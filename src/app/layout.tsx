
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

        {/* Mobile & PWA Configuration */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ALAN" />
        <meta name="application-name" content="ALAN" />
        <meta name="theme-color" content="#000000" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Icons for iOS */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16.png" />

        {/* Splash screens for iOS - prevents white flash */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
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
