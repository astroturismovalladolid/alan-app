import Image from 'next/image';
import Link from 'next/link';
import { mockImages } from '@/lib/data';
import type { LightPollutionImage } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { StarRating } from '@/components/star-rating';
import { MapPin } from 'lucide-react';

function ImageCard({ image }: { image: LightPollutionImage }) {
  return (
    <Link href={`/images/${image.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={image.url}
              alt={image.description}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={image.dataAiHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <p className="font-headline text-lg font-bold leading-tight">{image.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between p-4 pt-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{image.location}</span>
          </div>
          <StarRating rating={image.rating} />
        </CardFooter>
      </Card>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
            Community Gallery
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explore images of light pollution shared by the community.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockImages.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      </div>
    </main>
  );
}
