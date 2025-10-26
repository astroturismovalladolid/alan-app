'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud, Wand2, Loader2 } from 'lucide-react';
import { suggestOptimalImageCaptureSettings } from '@/ai/flows/suggest-optimal-image-capture-settings';
import type { SuggestOptimalImageCaptureSettingsOutput } from '@/ai/flows/suggest-optimal-image-capture-settings';

const formSchema = z.object({
  cameraMake: z.string().optional(),
  cameraModel: z.string().optional(),
  iso: z.coerce.number().optional(),
  aperture: z.string().optional(),
  shutterSpeed: z.string().optional(),
  image: z.any().refine((files) => files?.length === 1, 'Image is required.'),
});

// Function to convert image file to data URI
async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function SettingsSuggester() {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestOptimalImageCaptureSettingsOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined,
    },
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const photoDataUri = await fileToDataURL(values.image[0]);
      const response = await suggestOptimalImageCaptureSettings({
        photoDataUri,
        ...values
      });
      setResult(response);
    } catch (error) {
      console.error('AI suggestion failed:', error);
      toast({
        variant: 'destructive',
        title: 'Suggestion Error',
        description: 'Could not get suggestions for the image. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Optimal Capture Settings</CardTitle>
        <CardDescription>Upload a photo of light pollution and get AI-powered suggestions for your camera settings to improve future shots.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sample Image</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center justify-center w-full">
                      <label htmlFor="suggester-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-border bg-card hover:bg-accent">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Image preview" className="object-contain h-full w-full rounded-lg" />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> your photo</p>
                          </div>
                        )}
                        <Input id="suggester-file" type="file" className="hidden" accept="image/*"
                          onChange={(e) => {
                            field.onChange(e.target.files);
                            handleImageChange(e);
                          }}
                        />
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="cameraMake" render={({ field }) => (
                <FormItem><FormLabel>Camera Make (Optional)</FormLabel><FormControl><Input placeholder="e.g., Sony" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="cameraModel" render={({ field }) => (
                <FormItem><FormLabel>Camera Model (Optional)</FormLabel><FormControl><Input placeholder="e.g., A7 III" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="iso" render={({ field }) => (
                <FormItem><FormLabel>ISO (Optional)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1600" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="aperture" render={({ field }) => (
                <FormItem><FormLabel>Aperture (Optional)</FormLabel><FormControl><Input placeholder="e.g., f/2.8" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="shutterSpeed" render={({ field }) => (
                <FormItem><FormLabel>Shutter Speed (Optional)</FormLabel><FormControl><Input placeholder="e.g., 15s" {...field} /></FormControl></FormItem>
              )} />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Wand2 className="mr-2 h-4 w-4" /> Get Suggestions</>
              )}
            </Button>
          </form>
        </Form>

        {result && (
          <div className="mt-8 space-y-6 pt-6 border-t">
            <h3 className="font-headline text-2xl text-center">Suggested Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <Card className="bg-background"><CardHeader><CardDescription>ISO</CardDescription><CardTitle className="text-primary">{result.suggestedSettings.iso}</CardTitle></CardHeader></Card>
              <Card className="bg-background"><CardHeader><CardDescription>Aperture</CardDescription><CardTitle className="text-primary">{result.suggestedSettings.aperture}</CardTitle></CardHeader></Card>
              <Card className="bg-background"><CardHeader><CardDescription>Shutter Speed</CardDescription><CardTitle className="text-primary">{result.suggestedSettings.shutterSpeed}</CardTitle></CardHeader></Card>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Additional Tips</h4>
              <p className="text-sm text-muted-foreground bg-accent/20 p-4 rounded-md">{result.suggestedSettings.additionalTips}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
