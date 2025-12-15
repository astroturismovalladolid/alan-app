
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Camera, Star, LocateFixed, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/context/language-context';
import { addObservation } from '@/lib/observations-service';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { LocationPrecision } from '@/lib/types';
import { useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  rating: z.number().min(1, { message: 'Please select a rating.' }).max(5),
  image: z.string().refine((data) => data.startsWith('data:image/'), {
    message: 'A captured image is required.',
  }),
  locationPrecision: z.enum(['exact', 'approximate', 'anonymous']),
  isAnonymous: z.boolean(),
  acceptLocationSharing: z.boolean().refine((val) => val === true, {
    message: 'You must accept sharing your location to continue.',
  }),
});

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-8 w-8 cursor-pointer transition-colors',
            (hoverValue || value) >= star
              ? 'text-primary fill-current'
              : 'text-muted-foreground'
          )}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
        />
      ))}
    </div>
  );
}

interface UploadFormProps {
  onUploadSuccess?: () => void;
}

export function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      rating: 0,
      locationPrecision: 'exact',
      isAnonymous: false,
      acceptLocationSharing: false,
    },
  });

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t('geolocationNotSupported'));
      return;
    }

    setLocationError(null); // Clear previous errors

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });
        form.setValue('latitude', latitude);
        form.setValue('longitude', longitude);
        setLocationError(null);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError(t('geolocationPermissionDenied'));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    // Try to get location on mount, but this might be blocked by browser
    // If blocked, it will be requested again when user interacts
    getLocation();
  }, []);

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Resize image to max 1200px width/height while maintaining aspect ratio
          const maxSize = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with 85% quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedImage(compressedDataUrl);
          form.setValue('image', compressedDataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    form.resetField('image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Check if user is logged in (required for non-anonymous observations)
    if (!user && !values.isAnonymous) {
        setUploadError(t('logInToSubmit'));
        return;
    }

    setIsSubmitting(true);
    setUploadError(null); // Clear previous errors
    try {
      const result = await addObservation({
        latitude: values.latitude,
        longitude: values.longitude,
        description: values.description,
        rating: values.rating,
        image: values.image,
        locationPrecision: values.locationPrecision,
        isAnonymous: values.isAnonymous,
        authorId: values.isAnonymous ? undefined : user?.uid,
        authorName: values.isAnonymous ? 'Anonymous' : (user?.displayName || 'Anonymous'),
      });

      if (result.success) {
        // Trigger server-side cache revalidation (ISR)
        await fetch('/api/observations/revalidate', { method: 'POST' });

        // Invalidate React Query cache to force immediate refetch
        await queryClient.invalidateQueries({ queryKey: ['observations'] });

        toast({
          title: t('uploadSuccessful'),
          description: t('observationSubmitted'),
        });
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      const errorDescription = error?.message || t('observationSubmitError');
      setUploadError(errorDescription);
      console.error('Upload error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollArea className="h-[70vh] sm:h-auto">
      <div className="pr-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormItem>
              <FormLabel>{t('image')}</FormLabel>
              <div className="relative w-full min-h-[200px] max-h-[400px] bg-card border rounded-md overflow-hidden flex items-center justify-center">
                {capturedImage ? (
                  <img src={capturedImage} alt={t('capturedImageAlt')} className="w-full h-full object-contain" />
                ) : null}
              </div>
              <div className="mt-2 flex gap-2">
                {!capturedImage ? (
                  <Button type="button" onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    {t('takePhoto')}
                  </Button>
                ) : (
                  <Button type="button" onClick={retakeImage} variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('retake')}
                  </Button>
                )}
              </div>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageCapture} 
                />
              </FormControl>
              <FormField control={form.control} name="image" render={() => <FormMessage />} />
            </FormItem>
            
            <FormItem>
              <FormLabel>{t('location')}</FormLabel>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                  <LocateFixed className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm">
                    {location ? (
                      <span>
                        Lat: {location.lat.toFixed(4)}, Lon: {location.lon.toFixed(4)}
                      </span>
                    ) : locationError ? (
                      <span className="text-destructive">{locationError}</span>
                    ) : (
                      <span>{t('fetchingLocation')}</span>
                    )}
                  </div>
                </div>
                {(locationError || !location) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={getLocation}
                    title={t('retryLocation') || 'Retry location'}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <FormField control={form.control} name="latitude" render={() => <FormMessage />} />
            </FormItem>

            {/* Privacy Warning Alert */}
            <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertDescription className="text-amber-800 dark:text-amber-300">
                <strong>{t('locationPrivacyWarning')}</strong>
                <br />
                <span className="text-sm">{t('locationPrivacyDescription')}</span>
              </AlertDescription>
            </Alert>

            {/* Location Precision Selection */}
            <FormField
              control={form.control}
              name="locationPrecision"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('locationPrivacy')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="exact" id="exact" />
                        <div className="flex-1">
                          <Label htmlFor="exact" className="font-medium cursor-pointer">
                            {t('locationPrecisionExact')}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t('locationPrecisionExactDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="approximate" id="approximate" />
                        <div className="flex-1">
                          <Label htmlFor="approximate" className="font-medium cursor-pointer">
                            {t('locationPrecisionApproximate')}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t('locationPrecisionApproximateDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="anonymous" id="anonymous" />
                        <div className="flex-1">
                          <Label htmlFor="anonymous" className="font-medium cursor-pointer">
                            {t('locationPrecisionAnonymous')}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t('locationPrecisionAnonymousDesc')}
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Anonymous Observation Checkbox */}
            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      {t('makeObservationAnonymous')}
                    </FormLabel>
                    <FormDescription>
                      {t('anonymousObservationDesc')}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('describeObservation')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('illuminationQuality')}</FormLabel>
                  <FormControl>
                    <StarRatingInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>{t('illuminationQualityDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Accept Location Sharing Checkbox - REQUIRED */}
            <FormField
              control={form.control}
              name="acceptLocationSharing"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border-2 border-primary/50 bg-primary/5 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer font-semibold">
                      {t('iAcceptSharingLocation')}
                    </FormLabel>
                    <FormDescription className="text-xs">
                      {t('locationSharedPublicly')}
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {uploadError && (
              <div className="rounded-md bg-destructive/15 p-4 border border-destructive/30">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-5 w-5 text-destructive">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-destructive">{t('uploadFailed')}</h3>
                    <p className="mt-1 text-sm text-destructive/90">{uploadError}</p>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !form.watch('acceptLocationSharing')}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? t('submitting') : t('submitObservation')}
            </Button>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
}
