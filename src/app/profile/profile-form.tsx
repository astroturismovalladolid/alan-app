
'use client';

import { useState, useRef, useEffect } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Save } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { SecurityRuleContext } from '@/firebase/errors';
import { dataUrlToBlob, getImageMetadata } from '@/lib/image-utils';

const profileFormSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters.'),
  bio: z.string().max(160, 'Bio cannot be more than 160 characters.').optional(),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  onUpdateSuccess?: () => void;
}

export function ProfileForm({ onUpdateSuccess }: ProfileFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      bio: '',
      avatar: '',
    },
  });

  useEffect(() => {
    if (user) {
        const fetchUserData = async () => {
            const userRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userRef).catch(async (serverError) => {
                 const permissionError = new FirestorePermissionError({
                    path: userRef.path,
                    operation: 'get',
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
            });
            if (docSnap && docSnap.exists()) {
                const userData = docSnap.data();
                form.reset({
                    username: userData.displayName || '',
                    bio: userData.bio || '',
                    avatar: userData.photoURL || '',
                });
                setAvatarPreview(userData.photoURL || null);
            }
        };
        fetchUserData();
    }
  }, [user, form]);



  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Resize avatar to 400x400 square
          const size = 400;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          // Calculate dimensions to crop to square
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          // Draw cropped and resized image
          ctx?.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

          // Convert to JPEG with 85% quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarPreview(compressedDataUrl);
          form.setValue('avatar', compressedDataUrl, { shouldDirty: true });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;

    try {
      let avatarUrl = form.getValues('avatar');
      // If a new avatar has been selected (it will be a data URL)
      if (form.formState.dirtyFields.avatar && data.avatar && data.avatar.startsWith('data:image')) {
          const storage = getStorage();
          const avatarRef = ref(storage, `avatars/${user.uid}`);
          const avatarBlob = dataUrlToBlob(data.avatar);
          const metadata = getImageMetadata('image/jpeg');

          await uploadBytes(avatarRef, avatarBlob, metadata);
          avatarUrl = await getDownloadURL(avatarRef);
      }

      const userRef = doc(db, 'users', user.uid);
      const updatedData = {
          displayName: data.username,
          bio: data.bio,
          photoURL: avatarUrl,
      };

      await updateDoc(userRef, updatedData);

      toast({
        title: t('profileUpdated'),
        description: t('yourChangesHaveBeenSaved'),
      });

      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message || t('failedToUpdateProfile'),
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-4">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarPreview || undefined} alt={form.watch('username')} />
            <AvatarFallback>{form.watch('username')?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <FormLabel>{t('profilePicture')}</FormLabel>
            <div className="mt-2">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud className="mr-2 h-4 w-4" />
                {t('changeAvatar')}
                </Button>
                <Input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t('avatarFormat')}</p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('username')}</FormLabel>
              <FormControl>
                <Input placeholder={t('yourUsername')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bio')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('tellUsAboutYourself')}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {t('saveChanges')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
