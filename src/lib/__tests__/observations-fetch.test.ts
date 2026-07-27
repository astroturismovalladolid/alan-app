import { fetchObservations } from '../observations-fetch';
import { getDocs } from 'firebase/firestore';

jest.mock('firebase/firestore');
jest.mock('firebase/storage');

const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

function snapshotFrom(docs: Array<{ id: string; data: Record<string, any> }>) {
  return {
    forEach: (cb: (doc: any) => void) => {
      docs.forEach((d) => cb({ id: d.id, data: () => d.data }));
    },
  } as any;
}

describe('fetchObservations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not produce NaN for an anonymous observation with an empty ratings map', async () => {
    mockGetDocs.mockResolvedValue(
      snapshotFrom([
        {
          id: 'obs-1',
          data: {
            imageUrl: 'https://example.com/image.jpg',
            latitude: 40.7128,
            longitude: -74.006,
            description: 'An anonymous observation with no ratings yet',
            rating: 3,
            ratings: {}, // anonymous observations start with no ratings (observations-service.ts)
            reports: [],
            isAnonymous: true,
          },
        },
      ])
    );

    const [observation] = await fetchObservations();

    expect(observation.rating).toBe(0);
    expect(Number.isNaN(observation.rating)).toBe(false);
    expect(observation.ratings).toEqual({});
  });

  it('averages an authenticated observation ratings map correctly', async () => {
    mockGetDocs.mockResolvedValue(
      snapshotFrom([
        {
          id: 'obs-2',
          data: {
            imageUrl: 'https://example.com/image.jpg',
            latitude: 40.7128,
            longitude: -74.006,
            description: 'An observation with two ratings',
            rating: 3,
            authorId: 'author-1',
            ratings: { 'author-1': 3, 'user-2': 5 },
            reports: [],
            isAnonymous: false,
          },
        },
      ])
    );

    const [observation] = await fetchObservations();

    expect(observation.rating).toBe(4); // Math.round((3 + 5) / 2)
  });
});
