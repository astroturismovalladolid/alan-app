import type { LightPollutionImage, ForumTopic } from '@/lib/types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    if (!img) {
        // Fallback for safety, though it shouldn't be needed
        return { url: 'https://picsum.photos/seed/error/800/600', dataAiHint: 'error' };
    }
    return { url: img.imageUrl, dataAiHint: img.imageHint };
}

export const mockImages: LightPollutionImage[] = [
  {
    id: '1',
    ...getImage('night-city-1'),
    location: 'Downtown, Metropolis',
    rating: 4.5,
    description: 'The light from the skyscrapers completely washes out the night sky. It\'s impossible to see any stars.',
    author: 'Stargazer_1',
    timestamp: '2024-05-10T22:30:00Z',
  },
  {
    id: '2',
    ...getImage('sky-glow-1'),
    location: 'City Outskirts',
    rating: 3.8,
    description: 'Even 20 miles from the city center, the sky has an unnatural orange glow.',
    author: 'NightWatcher',
    timestamp: '2024-05-09T23:00:00Z',
  },
  {
    id: '3',
    ...getImage('starry-night-polluted'),
    location: 'Suburban Park',
    rating: 3.2,
    description: 'You can make out a few constellations, but the Milky Way is completely invisible due to surrounding neighborhood lights.',
    author: 'AstroAmy',
    timestamp: '2024-05-11T01:15:00Z',
  },
  {
    id: '4',
    ...getImage('street-lamp-1'),
    location: 'Residential Street',
    rating: 5.0,
    description: 'This new LED street lamp is unshielded and blindingly bright. It shines directly into my bedroom window.',
    author: 'TiredResident',
    timestamp: '2024-05-12T02:00:00Z',
  },
  {
    id: '5',
    ...getImage('industrial-light'),
    location: 'Industrial Zone',
    rating: 4.8,
    description: 'The entire industrial park is lit up like it\'s daytime, all night long.',
    author: 'EcoWarrior',
    timestamp: '2024-05-08T21:45:00Z',
  },
  {
    id: '6',
    ...getImage('suburban-sky'),
    location: 'My Backyard',
    rating: 3.5,
    description: 'Trying to do some astrophotography but the background sky brightness is just too high.',
    author: 'LensMan',
    timestamp: '2024-05-11T23:50:00Z',
  },
];
