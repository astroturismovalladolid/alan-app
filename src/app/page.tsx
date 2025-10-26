'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Camera, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UploadForm } from './upload/upload-form';

export default function Home() {
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  const Map = useMemo(() => dynamic(() => import('@/components/map'), { 
    ssr: false 
  }), []);

  return (
    <main className="relative h-screen w-screen">
      <Map />
       <div className="absolute top-8 right-8 z-[1000]">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 p-0"
          onClick={() => { /* Placeholder for profile action */ }}
        >
          <User className="h-8 w-8" />
        </Button>
      </div>
      <div className="absolute bottom-8 right-8 z-[1000]">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 p-0"
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
