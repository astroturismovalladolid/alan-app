
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
          <HelpCircle className="h-8 w-8" />
        </Button>
      </div>
      <div className="absolute bottom-8 right-8 z-[1000]">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 p-0 bg-card text-card-foreground shadow-lg hover:bg-accent dark:bg-black night:bg-primary night:hover:bg-primary/90 night:text-primary-foreground"
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
            <DialogTitle>Información sobre Contaminación Lumínica</DialogTitle>
            <DialogDescription>
              Aprende sobre la contaminación lumínica, sus efectos y cómo contribuir a un cielo nocturno más oscuro
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="pollution" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pollution">Contaminación</TabsTrigger>
              <TabsTrigger value="lighting">Iluminación</TabsTrigger>
              <TabsTrigger value="app">Cómo usar</TabsTrigger>
              <TabsTrigger value="credits">Créditos</TabsTrigger>
            </TabsList>

            <TabsContent value="pollution" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">¿Qué es la contaminación lumínica?</h3>
                <p className="text-sm text-muted-foreground">
                  La contaminación lumínica es la alteración de los niveles naturales de luz nocturna causada por fuentes de luz artificial.
                  Este fenómeno tiene consecuencias significativas para la salud humana, la biodiversidad y nuestra capacidad de observar el cielo nocturno.
                </p>

                <h4 className="font-semibold mt-4">Efectos en la salud humana</h4>
                <p className="text-sm text-muted-foreground">
                  La exposición a luz artificial durante la noche puede alterar los ritmos circadianos, afectando la producción de melatonina
                  y aumentando el riesgo de trastornos del sueño, obesidad, diabetes, depresión y ciertos tipos de cáncer.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Referencias: Stevens et al. (2014) "Light at night, circadian disruption and breast cancer" British Journal of Cancer;
                  Fonken & Nelson (2014) "The effects of light at night on circadian clocks and metabolism" Endocrine Reviews
                </p>

                <h4 className="font-semibold mt-4">Impacto en la biodiversidad</h4>
                <p className="text-sm text-muted-foreground">
                  La luz artificial nocturna altera los comportamientos de navegación, alimentación y reproducción de muchas especies.
                  Afecta especialmente a insectos nocturnos, aves migratorias, murciélagos y tortugas marinas, contribuyendo a la pérdida de biodiversidad.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Referencias: Longcore & Rich (2004) "Ecological light pollution" Frontiers in Ecology;
                  Gaston et al. (2013) "The ecological impacts of nighttime light pollution" Journal of Ecology
                </p>

                <h4 className="font-semibold mt-4">Pérdida del cielo nocturno</h4>
                <p className="text-sm text-muted-foreground">
                  Más del 80% de la población mundial vive bajo cielos contaminados lumínicamente. Esta pérdida del cielo estrellado
                  nos desconecta de nuestro patrimonio natural y cultural, limitando la investigación astronómica y la inspiración que
                  el cosmos ha proporcionado a la humanidad durante milenios.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Referencias: Falchi et al. (2016) "The new world atlas of artificial night sky brightness" Science Advances;
                  Kyba et al. (2017) "Artificially lit surface of Earth at night increasing in radiance and extent" Science Advances
                </p>
              </div>
            </TabsContent>

            <TabsContent value="lighting" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Cómo iluminar de forma responsable</h3>
                <p className="text-sm text-muted-foreground">
                  Una iluminación bien diseñada puede proporcionar seguridad y funcionalidad mientras minimiza la contaminación lumínica.
                </p>

                <h4 className="font-semibold mt-4">Temperatura de color</h4>
                <p className="text-sm text-muted-foreground">
                  • <strong>Preferir luces cálidas:</strong> Temperaturas de color por debajo de 3000K (tonos ámbar/amarillos)<br />
                  • <strong>Evitar luz azul:</strong> La luz blanca fría (&gt;4000K) suprime más la melatonina y dispersa más luz en la atmósfera<br />
                  • <strong>LEDs ámbar:</strong> Son la mejor opción para exteriores (1800-2200K)
                </p>

                <h4 className="font-semibold mt-4">Orientación y diseño</h4>
                <p className="text-sm text-muted-foreground">
                  • <strong>Iluminar hacia abajo:</strong> Usar luminarias completamente apantalladas que dirijan la luz solo donde se necesita<br />
                  • <strong>Cero emisión superior:</strong> Ninguna luz debe emitirse por encima de la horizontal<br />
                  • <strong>Evitar deslumbramiento:</strong> Proteger las fuentes de luz para que no sean directamente visibles
                </p>

                <h4 className="font-semibold mt-4">Intensidad apropiada</h4>
                <p className="text-sm text-muted-foreground">
                  • <strong>Solo lo necesario:</strong> Usar la mínima intensidad que cumpla el propósito<br />
                  • <strong>No sobreiluminar:</strong> Más luz no siempre significa más seguridad<br />
                  • <strong>Regulación inteligente:</strong> Dimming en horarios de bajo uso
                </p>

                <h4 className="font-semibold mt-4">Detección de presencia</h4>
                <p className="text-sm text-muted-foreground">
                  • <strong>Sensores de movimiento:</strong> La luz solo cuando se necesita<br />
                  • <strong>Temporizadores:</strong> Apagado automático después del horario necesario<br />
                  • <strong>Ahorro energético:</strong> Reduce consumo y emisiones de CO₂
                </p>
              </div>
            </TabsContent>

            <TabsContent value="app" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Cómo utilizar la aplicación ALAN</h3>

                <h4 className="font-semibold mt-4">1. Capturar una observación</h4>
                <p className="text-sm text-muted-foreground">
                  • Haz clic en el botón de <strong>cámara</strong> (esquina inferior derecha)<br />
                  • Sube una foto del cielo nocturno o de una fuente de contaminación lumínica<br />
                  • Añade información relevante sobre la ubicación y condiciones
                </p>

                <h4 className="font-semibold mt-4">2. Explorar el mapa</h4>
                <p className="text-sm text-muted-foreground">
                  • Navega por el mapa para ver observaciones de otros usuarios<br />
                  • Los marcadores muestran diferentes niveles de contaminación lumínica<br />
                  • Haz clic en un marcador para ver detalles de la observación
                </p>

                <h4 className="font-semibold mt-4">3. Compartir y colaborar</h4>
                <p className="text-sm text-muted-foreground">
                  • Tus observaciones ayudan a crear un mapa global de contaminación lumínica<br />
                  • Participa en el foro de la comunidad para discutir y compartir experiencias<br />
                  • Contribuye a la ciencia ciudadana y la concienciación ambiental
                </p>

                <h4 className="font-semibold mt-4">4. Configuración personal</h4>
                <p className="text-sm text-muted-foreground">
                  • Accede a tu perfil desde el menú superior derecho<br />
                  • Personaliza tus preferencias de idioma y tema<br />
                  • Revisa tu historial de observaciones
                </p>
              </div>
            </TabsContent>

            <TabsContent value="credits" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Créditos y Reconocimientos</h3>

                <h4 className="font-semibold mt-4">Sobre ALAN</h4>
                <p className="text-sm text-muted-foreground">
                  ALAN (Artificial Light At Night) es una plataforma de ciencia ciudadana dedicada a documentar y combatir
                  la contaminación lumínica a nivel global. Nuestro objetivo es empoderar a las comunidades con datos para
                  promover políticas de iluminación más sostenibles.
                </p>

                <h4 className="font-semibold mt-4">Desarrollo</h4>
                <p className="text-sm text-muted-foreground">
                  Esta aplicación ha sido desarrollada con tecnologías web modernas incluyendo Next.js, React, y Firebase,
                  con el objetivo de hacer la ciencia ciudadana accesible a todos.
                </p>

                <h4 className="font-semibold mt-4">Agradecimientos</h4>
                <p className="text-sm text-muted-foreground">
                  • International Dark-Sky Association (IDA)<br />
                  • Comunidad científica dedicada al estudio de la contaminación lumínica<br />
                  • Todos los usuarios que contribuyen con sus observaciones<br />
                  • Organizaciones de conservación del cielo nocturno
                </p>

                <h4 className="font-semibold mt-4">Recursos adicionales</h4>
                <p className="text-sm text-muted-foreground">
                  • <strong>DarkSky International:</strong> darksky.org<br />
                  • <strong>Globe at Night:</strong> globeatnight.org<br />
                  • <strong>Light Pollution Map:</strong> lightpollutionmap.info<br />
                  • <strong>Loss of the Night App:</strong> Otra aplicación de ciencia ciudadana
                </p>

                <h4 className="font-semibold mt-4">Licencia</h4>
                <p className="text-sm text-muted-foreground">
                  Los datos recopilados a través de ALAN están disponibles para investigación científica y educación.
                  Al contribuir, ayudas a crear un recurso global para la conservación del cielo nocturno.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </main>
  );
}
