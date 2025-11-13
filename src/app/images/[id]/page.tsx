import Image from 'next/image';
import { notFound } from 'next/navigation';
import { mockImages } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/star-rating';
import { MapPin, User, Calendar } from 'lucide-react';
import { AiAnalysis } from './ai-analysis';
import { Separator } from '@/components/ui/separator';

export default async function ImageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = mockImages.find((img) => img.id === id);

  if (!image) {
    notFound();
  }

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={image.url}
                  alt={image.description}
                  fill
                  className="object-contain"
                  data-ai-hint={image.dataAiHint}
                  priority
                />
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-3xl">{image.description}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">{image.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg text-foreground">User Rating</span>
                  <StarRating rating={image.rating} />
                </div>
                <Separator />
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{image.author}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(image.timestamp).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <AiAnalysis imageUrl={image.url} />

          </div>
        </div>
      </div>
    </main>
  );
}
