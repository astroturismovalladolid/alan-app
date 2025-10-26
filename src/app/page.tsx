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
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const userAvatar = PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl;

  const Map = useMemo(() => dynamic(() => import('@/components/map'), { 
    ssr: false 
  }), []);

  return (
    <main className="relative h-screen w-screen">
      <Map />
       <div className="absolute top-8 right-8 z-[1000]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-auto items-center gap-3 rounded-full bg-white p-2 pr-4 shadow-lg hover:bg-gray-100">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userAvatar} alt="Alex Doe" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium text-black">Alex Doe</p>
                <p className="text-xs text-muted-foreground">Newbie</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="absolute bottom-8 right-8 z-[1000]">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 p-0 bg-white text-black shadow-lg hover:bg-gray-100"
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
    </main>
  );
}
