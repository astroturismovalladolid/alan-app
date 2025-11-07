
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
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { SecurityRuleContext } from '@/firebase/errors';

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
        const dataUrl = reader.result as string;
        setAvatarPreview(dataUrl);
        form.setValue('avatar', dataUrl, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;

    let avatarUrl = form.getValues('avatar');
    // If a new avatar has been selected (it will be a data URL)
    if (form.formState.dirtyFields.avatar && data.avatar && data.avatar.startsWith('data:image')) {
        const storage = getStorage();
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await uploadString(avatarRef, data.avatar, 'data_url');
        avatarUrl = await getDownloadURL(avatarRef);
    }

    const userRef = doc(db, 'users', user.uid);
    const updatedData = {
        displayName: data.username,
        bio: data.bio,
        photoURL: avatarUrl,
    };
    updateDoc(userRef, updatedData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: updatedData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });

    toast({
      title: t('profileUpdated'),
      description: t('yourChangesHaveBeenSaved'),
    });

    if (onUpdateSuccess) {
      onUpdateSuccess();
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
