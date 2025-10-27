
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
import { useLanguage } from '@/context/language-context';

export default function Home() {
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const userAvatar = PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl;
  const { t } = useLanguage();

  const Map = useMemo(() => dynamic(() => import('@/components/map'), { 
    ssr: false 
  }), []);

  return (
    <main className="relative h-screen w-screen">
      <Map />
      <div className="absolute top-8 left-8 z-[1000]">
        <h1 className="text-5xl font-bold tracking-wider text-white dark:text-black night:text-primary [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)] dark:[text-shadow:2px_2px_4px_rgba(255,255,255,0.2)] night:[text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">ALAN</h1>
      </div>
       <div className="absolute top-8 right-8 z-[1000]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-auto items-center gap-3 rounded-full bg-card p-2 pr-4 text-card-foreground shadow-lg hover:bg-accent night:hover:bg-accent/50 night:bg-card/80">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userAvatar} alt="Alex Doe" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{t('username')}</p>
                <p className="text-xs text-muted-foreground">{t('newbie')}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-xl border-0">
            <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setProfileModalOpen(true)}>{t('profile')}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSettingsModalOpen(true)}>{t('settings')}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t('logOut')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="absolute bottom-8 right-8 z-[1000]">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 p-0 bg-card text-card-foreground shadow-lg hover:bg-accent night:bg-primary night:hover:bg-primary/90 night:text-primary-foreground"
          onClick={() => setUploadModalOpen(true)}
        >
          <Camera className="h-8 w-8" />
        </Button>
      </div>

      <Dialog open={isUploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('shareYourObservation')}</DialogTitle>
            <DialogDescription>
              {t('helpMapLightPollution')}
            </DialogDescription>
          </DialogHeader>
          <UploadForm onUploadSuccess={() => setUploadModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('editProfile')}</DialogTitle>
            <DialogDescription>
              {t('manageYourAccount')}
            </DialogDescription>
          </DialogHeader>
          <ProfileForm onUpdateSuccess={() => setProfileModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('settings')}</DialogTitle>
            <DialogDescription>
              {t('customizeYourExperience')}
            </DialogDescription>
          </DialogHeader>
          <SettingsForm onUpdateSuccess={() => setSettingsModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </main>
  );
}
