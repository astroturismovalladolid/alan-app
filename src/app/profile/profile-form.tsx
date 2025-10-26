'use client';

import { useState, useRef } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Save } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/context/language-context';

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
  const userAvatar = PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl;
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userAvatar || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: 'Alex Doe',
      bio: t('defaultBio'),
      avatar: userAvatar,
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAvatarPreview(dataUrl);
        form.setValue('avatar', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(data: ProfileFormValues) {
    console.log(data);
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
