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
  // Placeholder for i18n
  const [language, setLanguage] = useState('en');

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      language: 'en',
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
    document.documentElement.classList.remove('light', 'dark', 'night');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);


  function onSubmit(data: SettingsFormValues) {
    console.log(data);
    setLanguage(data.language);
    toast({
      title: 'Settings Saved',
      description: 'Your new settings have been applied.',
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
              <FormLabel>Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
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
              <FormLabel>Visualization Mode</FormLabel>
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
                      Light
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="dark" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Dark
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="night" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Night
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
                Save Settings
            </Button>
        </div>
      </form>
    </Form>
  );
}
