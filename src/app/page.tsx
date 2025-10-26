'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UploadForm } from './upload/upload-form';
import { ProfileForm } from './profile/profile-form';
import { SettingsForm } from './settings/settings-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const userAvatar = PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl;

  const Map = useMemo(() => dynamic(() => import('@/components/map'), { 
    ssr: false 
  }), []);

  return (
    <main className="relative h-screen w-screen">
      <Map />
      <div className="absolute top-8 left-8 z-[1000]">
        <h1 className="text-5xl font-bold text-foreground tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>ALAN</h1>
      </div>
       <div className="absolute top-8 right-8 z-[1000]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-auto items-center gap-3 rounded-full bg-card p-2 pr-4 shadow-lg hover:bg-accent">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userAvatar} alt="Alex Doe" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium text-card-foreground">Alex Doe</p>
                <p className="text-xs text-muted-foreground">Newbie</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-0 shadow-lg">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setProfileModalOpen(true)}>Profile</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSettingsModalOpen(true)}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="absolute bottom-8 right-8 z-[1000]">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 p-0 bg-card text-card-foreground shadow-lg hover:bg-accent"
          onClick={() => setUploadModalOpen(true)}
        >
          <Camera className="h-8 w-8" />
        </Button>
      </div>

      <Dialog open={isUploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Your Observation</DialogTitle>
            <DialogDescription>
              Help map light pollution by uploading an image.
            </DialogDescription>
          </DialogHeader>
          <UploadForm onUploadSuccess={() => setUploadModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Manage your account settings and public profile.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm onUpdateSuccess={() => setProfileModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Customize your experience.
            </DialogDescription>
          </DialogHeader>
          <SettingsForm onUpdateSuccess={() => setSettingsModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </main>
  );
}
