
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';

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

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      language: language,
      theme: 'dark',
    },
  });

  const theme = form.watch('theme');

  useEffect(() => {
    const currentTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'night' | null;
    if (currentTheme) {
        form.setValue('theme', currentTheme);
    }
  }, [form]);
  
  useEffect(() => {
    form.setValue('language', language);
  }, [language, form]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark', 'night');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);


  function onSubmit(data: SettingsFormValues) {
    setLanguage(data.language as 'en' | 'es' | 'fr');
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectLanguage')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
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
                  defaultValue={field.value}
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
