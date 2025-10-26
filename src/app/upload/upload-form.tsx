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
import { Camera, Star, LocateFixed, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  rating: z.number().min(1).max(5),
  image: z.string().refine((data) => data.startsWith('data:image/'), {
    message: 'A captured image is required.',
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
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      rating: 3,
    },
  });

  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          form.setValue('latitude', latitude);
          form.setValue('longitude', longitude);
          setLocationError(null);
        },
        () => {
          setLocationError('Unable to retrieve your location. Please ensure location services are enabled.');
        }
      );
    };

    getLocation();
  }, [form]);

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCapturedImage(dataUrl);
        form.setValue('image', dataUrl);
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values); // In a real app, you would upload this data.
    toast({
      title: 'Upload Successful!',
      description: 'Your observation has been submitted.',
    });
    if (onUploadSuccess) {
      onUploadSuccess();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormItem>
          <FormLabel>Image</FormLabel>
          <div className="relative w-full aspect-video bg-card border rounded-md overflow-hidden flex items-center justify-center">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="mt-2 flex gap-2">
            {!capturedImage ? (
               <Button type="button" onClick={() => fileInputRef.current?.click()} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            ) : (
              <Button type="button" onClick={retakeImage} variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retake
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
          <FormLabel>Location</FormLabel>
          <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
            <LocateFixed className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">
              {location ? (
                <span>
                  Lat: {location.lat.toFixed(4)}, Lon: {location.lon.toFixed(4)}
                </span>
              ) : locationError ? (
                <span className="text-destructive">{locationError}</span>
              ) : (
                'Fetching location...'
              )}
            </div>
          </div>
           <FormField control={form.control} name="latitude" render={() => <FormMessage />} />
        </FormItem>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what you see..."
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
              <FormLabel>Illumination Quality</FormLabel>
              <FormControl>
                <StarRatingInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>1 star is poor illumination, 5 stars is excellent.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full">
          Submit Observation
        </Button>
      </form>
    </Form>
  );
}
