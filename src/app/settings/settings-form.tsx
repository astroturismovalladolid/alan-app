
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const settingsFormSchema = z.object({
  language: z.string(),
  theme: z.enum(['light', 'dark', 'night']),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsFormProps {
  onUpdateSuccess?: () => void;
}

export function SettingsForm({ onUpdateSuccess }: SettingsFormProps) {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      language: language,
      theme: 'dark',
    },
  });

  const theme = form.watch('theme');

  // Load preferences from Firestore when component mounts
  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const savedTheme = userData.theme as 'light' | 'dark' | 'night' | undefined;

            if (savedTheme) {
              form.setValue('theme', savedTheme);
            }
          }
        } catch (error) {
          console.warn('Failed to load theme preference from Firestore:', error);
          // Fallback to localStorage
          const currentTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'night' | null;
          if (currentTheme) {
            form.setValue('theme', currentTheme);
          }
        }
      } else {
        // User not logged in, use localStorage
        const currentTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'night' | null;
        if (currentTheme) {
          form.setValue('theme', currentTheme);
        }
      }
    };

    loadPreferences();
  }, [form, user]);

  useEffect(() => {
    form.setValue('language', language);
  }, [language, form]);

  // Apply theme changes immediately to DOM
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark', 'night');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  async function onSubmit(data: SettingsFormValues) {
    // Update language (this already syncs to Firestore via language context)
    await setLanguage(data.language as 'en' | 'es' | 'fr');

    // Save theme to Firestore if user is logged in
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { theme: data.theme }, { merge: true });
      } catch (error) {
        console.warn('Failed to save theme preference to Firestore:', error);
      }
    }

    toast({
      title: t('settingsSaved'),
      description: t('yourNewSettingsHaveBeenApplied'),
    });
    if (onUpdateSuccess) {
      onUpdateSuccess();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-4">
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('language')}</FormLabel>
              <FormControl>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className={cn(
                      "flex-1 h-20 text-4xl transition-all",
                      field.value === 'en' && "ring-2 ring-primary bg-accent"
                    )}
                    onClick={() => field.onChange('en')}
                  >
                    🇺🇸
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className={cn(
                      "flex-1 h-20 text-4xl transition-all",
                      field.value === 'es' && "ring-2 ring-primary bg-accent"
                    )}
                    onClick={() => field.onChange('es')}
                  >
                    🇪🇸
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className={cn(
                      "flex-1 h-20 text-4xl transition-all",
                      field.value === 'fr' && "ring-2 ring-primary bg-accent"
                    )}
                    onClick={() => field.onChange('fr')}
                  >
                    🇫🇷
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('visualizationMode')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="light" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('light')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="dark" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('dark')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="night" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('night')}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {t('saveSettings')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
