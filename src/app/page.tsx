
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Camera, ChevronDown, Loader2, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadForm } from './upload/upload-form';
import { ProfileForm } from './profile/profile-form';
import { SettingsForm } from './settings/settings-form';
import { useLanguage } from '@/context/language-context';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/auth-context';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ displayName?: string; photoURL?: string; bio?: string } | null>(null);
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch user profile data from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile({
              displayName: data.displayName || user.displayName || undefined,
              photoURL: data.photoURL || user.photoURL || undefined,
              bio: data.bio || undefined,
            });
          } else {
            // Use Firebase Auth data if Firestore doc doesn't exist
            setUserProfile({
              displayName: user.displayName || undefined,
              photoURL: user.photoURL || undefined,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to Firebase Auth data
          setUserProfile({
            displayName: user.displayName || undefined,
            photoURL: user.photoURL || undefined,
          });
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const Map = useMemo(() => dynamic(() => import('@/components/map'), {
    ssr: false
  }), []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleProfileUpdate = async () => {
    setProfileModalOpen(false);
    // Refresh user profile data from Firestore
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProfile({
            displayName: data.displayName || user.displayName || undefined,
            photoURL: data.photoURL || user.photoURL || undefined,
            bio: data.bio || undefined,
          });
        }
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="relative h-screen w-screen">
      <Map />
      <div className="absolute top-8 left-8 z-[1000]">
        <h1 className="text-5xl font-bold tracking-wider text-foreground dark:!text-white night:text-primary [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)] dark:[text-shadow:2px_2px_4px_rgba(0,0,0,0.8)] night:[text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">ALAN</h1>
      </div>
       <div className="absolute top-8 right-8 z-[1000]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-auto items-center gap-3 rounded-full bg-card p-2 pr-4 text-card-foreground shadow-lg hover:bg-accent dark:bg-black night:bg-primary night:text-primary-foreground night:hover:bg-primary/90">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userProfile?.photoURL || user.photoURL || undefined} alt={userProfile?.displayName || user.displayName || 'User'} />
                <AvatarFallback>{(userProfile?.displayName || user.displayName)?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">{userProfile?.displayName || user.displayName || t('username')}</p>
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
            <DropdownMenuItem onSelect={handleLogout}>{t('logOut')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="absolute bottom-8 left-8 z-[1000]">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 p-0 bg-card text-card-foreground shadow-lg hover:bg-accent dark:bg-black night:bg-primary night:hover:bg-primary/90 night:text-primary-foreground"
          onClick={() => setInfoModalOpen(true)}
        >
          <HelpCircle className="h-6 w-6" strokeWidth={2.5} />
        </Button>
      </div>
      <div className="absolute bottom-8 right-8 z-[1000]">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 p-0 bg-card text-card-foreground shadow-lg hover:bg-accent dark:bg-black night:bg-primary night:hover:bg-primary/90 night:text-primary-foreground"
          onClick={() => setUploadModalOpen(true)}
        >
          <Camera className="h-6 w-6" strokeWidth={2.5} />
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
        <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('editProfile')}</DialogTitle>
            <DialogDescription>
              {t('manageYourAccount')}
            </DialogDescription>
          </DialogHeader>
          <ProfileForm onUpdateSuccess={handleProfileUpdate} />
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('settings')}</DialogTitle>
            <DialogDescription>
              {t('customizeYourExperience')}
            </DialogDescription>
          </DialogHeader>
          <SettingsForm onUpdateSuccess={() => setSettingsModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isInfoModalOpen} onOpenChange={setInfoModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{t('infoModalTitle')}</DialogTitle>
            <DialogDescription className="text-base">
              {t('infoModalDescription')}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="pollution" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pollution">{t('tabPollution')}</TabsTrigger>
              <TabsTrigger value="lighting">{t('tabLighting')}</TabsTrigger>
              <TabsTrigger value="app">{t('tabApp')}</TabsTrigger>
              <TabsTrigger value="credits">{t('tabCredits')}</TabsTrigger>
            </TabsList>

            <TabsContent value="pollution" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-xl">{t('pollutionTitle')}</h3>
                <p className="text-base text-muted-foreground">{t('pollutionIntro')}</p>

                <h4 className="font-semibold mt-4 text-lg">{t('pollutionHealthTitle')}</h4>
                <p className="text-base text-muted-foreground">{t('pollutionHealthText')}</p>
                <p className="text-sm text-muted-foreground italic">{t('pollutionHealthRefs')}</p>

                <h4 className="font-semibold mt-4 text-lg">{t('pollutionBiodiversityTitle')}</h4>
                <p className="text-base text-muted-foreground">{t('pollutionBiodiversityText')}</p>
                <p className="text-sm text-muted-foreground italic">{t('pollutionBiodiversityRefs')}</p>

                <h4 className="font-semibold mt-4 text-lg">{t('pollutionNightSkyTitle')}</h4>
                <p className="text-base text-muted-foreground">{t('pollutionNightSkyText')}</p>
                <p className="text-sm text-muted-foreground italic">{t('pollutionNightSkyRefs')}</p>
              </div>
            </TabsContent>

            <TabsContent value="lighting" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-xl">{t('lightingTitle')}</h3>
                <p className="text-base text-muted-foreground">{t('lightingIntro')}</p>

                <h4 className="font-semibold mt-4 text-lg">{t('lightingColorTitle')}</h4>
                <p className="text-base text-muted-foreground whitespace-pre-line">{t('lightingColorText')}</p>

                <h4 className="font-semibold mt-4 text-lg">{t('lightingOrientationTitle')}</h4>
                <p className="text-base text-muted-foreground whitespace-pre-line">{t('lightingOrientationText')}</p>

                <h4 className="font-semibold mt-4 text-lg">{t('lightingIntensityTitle')}</h4>
                <p className="text-base text-muted-foreground whitespace-pre-line">{t('lightingIntensityText')}</p>

                <h4 className="font-semibold mt-4 text-lg">{t('lightingDetectionTitle')}</h4>
                <p className="text-base text-muted-foreground whitespace-pre-line">{t('lightingDetectionText')}</p>
              </div>
            </TabsContent>

            <TabsContent value="app" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-xl">{t('appTitle')}</h3>

                <h4 className="font-semibold mt-4 text-lg">{t('appCaptureTitle')}</h4>
                <p className="text-base text-muted-foreground whitespace-pre-line">{t('appCaptureText')}</p>

                <h4 className="font-semibold mt-4 text-lg">{t('appMapTitle')}</h4>
                <p className="text-base text-muted-foreground whitespace-pre-line">{t('appMapText')}</p>

                <h4 className="font-semibold mt-4 text-lg">{t('appCollaborateTitle')}</h4>
                <p className="text-base text-muted-foreground whitespace-pre-line">{t('appCollaborateText')}</p>

                <h4 className="font-semibold mt-4 text-lg">{t('appSettingsTitle')}</h4>
                <p className="text-base text-muted-foreground whitespace-pre-line">{t('appSettingsText')}</p>
              </div>
            </TabsContent>

            <TabsContent value="credits" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-xl">{t('creditsTitle')}</h3>

                <h4 className="font-semibold mt-4 text-lg">{t('creditsAboutTitle')}</h4>
                <p className="text-base text-muted-foreground">{t('creditsAboutText')}</p>

                <h4 className="font-semibold mt-4 text-lg">{t('creditsDevelopmentTitle')}</h4>
                <p className="text-base text-muted-foreground">
                  {t('creditsDevelopmentText').split('Alejandro Catalá Espí')[0]}
                  <a
                    href="https://alejandrocatalaespi.es"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Alejandro Catalá Espí
                  </a>
                  {t('creditsDevelopmentText').split('Alejandro Catalá Espí')[1]}
                </p>

                <h4 className="font-semibold mt-4 text-lg">{t('creditsAcknowledgmentsTitle')}</h4>
                <div className="text-base text-muted-foreground">
                  <p>• <a href="https://darksky.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">International Dark-Sky Association (IDA)</a></p>
                  <p>• <a href="https://syrma.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Sociedad Astronómica Syrma</a></p>
                  <p>• {t('creditsAcknowledgmentsText').split('\n')[2]}</p>
                  <p>• {t('creditsAcknowledgmentsText').split('\n')[3]}</p>
                  <p>• {t('creditsAcknowledgmentsText').split('\n')[4]}</p>
                </div>

                <h4 className="font-semibold mt-4 text-lg">{t('creditsResourcesTitle')}</h4>
                <div className="text-base text-muted-foreground">
                  <p>• <a href="https://darksky.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DarkSky International: darksky.org</a></p>
                  <p>• <a href="https://globeatnight.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Globe at Night: globeatnight.org</a></p>
                  <p>• <a href="https://lightpollutionmap.info" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Light Pollution Map: lightpollutionmap.info</a></p>
                </div>

                <h4 className="font-semibold mt-4 text-lg">{t('creditsLicenseTitle')}</h4>
                <p className="text-base text-muted-foreground">{t('creditsLicenseText')}</p>

                <h4 className="font-semibold mt-4 text-lg">{t('creditsSupportTitle')}</h4>
                <p className="text-base text-muted-foreground mb-3">{t('creditsSupportText')}</p>
                <a
                  href="https://buymeacoffee.com/alejandrocatalaespi"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full sm:w-auto" variant="default">
                    {t('supportButton')}
                  </Button>
                </a>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </main>
  );
}
