import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/common/logo';
import { MainNav } from '@/components/common/main-nav';
import { Header } from '@/components/common/header';
import './globals.css';

export const metadata: Metadata = {
  title: 'ALAN - Anti-Light-Pollution Action Network',
  description: 'Upload, view, and discuss images of light pollution.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <Logo />
            </SidebarHeader>
            <SidebarContent>
              <MainNav />
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <Header />
            {children}
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
