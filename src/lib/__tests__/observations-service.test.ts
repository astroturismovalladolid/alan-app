import { addObservation } from '../observations-service';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';

// Mock Firebase functions
jest.mock('firebase/firestore');
jest.mock('firebase/storage');

// Mock image-utils module
jest.mock('@/lib/image-utils', () => ({
  dataUrlToBlob: jest.fn(() => new Blob(['test'], { type: 'image/jpeg' })),
  getImageMetadata: jest.fn(() => ({ contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000' })),
}));

const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockUploadBytes = uploadBytes as jest.MockedFunction<typeof uploadBytes>;
const mockGetDownloadURL = getDownloadURL as jest.MockedFunction<typeof getDownloadURL>;
const mockRef = ref as jest.MockedFunction<typeof ref>;

describe('Observations Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addObservation', () => {
    const validObservation = {
      latitude: 40.7128,
      longitude: -74.006,
      description: 'Test observation with sufficient detail',
      rating: 4,
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      authorId: 'test-user-123',
      locationPrecision: 'exact' as const,
      isAnonymous: false,
    };

    it('should reject observations with invalid data', async () => {
      const invalidObservation = {
        latitude: 40.7128,
        longitude: -74.006,
        description: 'Too short', // Less than 10 characters
        rating: 4,
        image: 'data:image/jpeg;base64,test',
        authorId: 'test-user-123',
      };

      await expect(addObservation(invalidObservation)).rejects.toThrow();
    });

    it('should reject observations with invalid rating', async () => {
      const invalidRating = {
        ...validObservation,
        rating: 6, // Rating should be 1-5
      };

      await expect(addObservation(invalidRating)).rejects.toThrow();
    });

    it('should reject observations with rating below 1', async () => {
      const invalidRating = {
        ...validObservation,
        rating: 0,
      };

      await expect(addObservation(invalidRating)).rejects.toThrow();
    });

    it('should successfully add valid observation', async () => {
      // Mock successful Firebase operations
      mockRef.mockReturnValue({} as any);
      mockUploadBytes.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue('https://example.com/image.jpg');
      mockAddDoc.mockResolvedValue({ id: 'test-doc-id' } as any);

      const result = await addObservation(validObservation);

      expect(result).toEqual({ success: true });
      expect(mockUploadBytes).toHaveBeenCalled();
      expect(mockGetDownloadURL).toHaveBeenCalled();
      expect(mockAddDoc).toHaveBeenCalled();
    });

    it('should handle storage upload errors gracefully', async () => {
      mockRef.mockReturnValue({} as any);
      mockUploadBytes.mockRejectedValue(new Error('Upload failed'));

      const result = await addObservation(validObservation);

      expect(result).toEqual({
        success: false,
        error: 'Upload failed',
      });
    });

    it('should handle Firestore errors gracefully', async () => {
      mockRef.mockReturnValue({} as any);
      mockUploadBytes.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue('https://example.com/image.jpg');
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await addObservation(validObservation);

      expect(result).toEqual({
        success: false,
        error: 'Firestore error',
      });
    });

    it('should accept anonymous observations without authorId', async () => {
      const anonymousObservation = {
        latitude: 40.7128,
        longitude: -74.006,
        description: 'Test anonymous observation',
        rating: 3,
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        locationPrecision: 'anonymous' as const,
        isAnonymous: true,
      };

      mockRef.mockReturnValue({} as any);
      mockUploadBytes.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue('https://example.com/image.jpg');
      mockAddDoc.mockResolvedValue({ id: 'test-doc-id' } as any);

      const result = await addObservation(anonymousObservation);

      expect(result).toEqual({ success: true });

      // Verify that the observation was added with rounded coordinates (1 decimal place)
      const callArgs = mockAddDoc.mock.calls[0][1];
      expect(callArgs.latitude).toBe(40.7); // Rounded to 1 decimal
      expect(callArgs.longitude).toBe(-74.0); // Rounded to 1 decimal
      expect(callArgs.isAnonymous).toBe(true);
      expect(callArgs.locationPrecision).toBe('anonymous');
      expect(callArgs.authorId).toBeUndefined();
    });

    it('should reject non-anonymous observations without authorId', async () => {
      const observationWithoutAuthor = {
        latitude: 40.7128,
        longitude: -74.006,
        description: 'Test observation without author',
        rating: 3,
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        locationPrecision: 'exact' as const,
        isAnonymous: false,
      };

      mockRef.mockReturnValue({} as any);
      mockUploadBytes.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue('https://example.com/image.jpg');

      const result = await addObservation(observationWithoutAuthor);

      expect(result.success).toBe(false);
      expect(result.error).toContain('authorId is required');
    });

    it('should validate latitude is a number', async () => {
      const invalidLatitude = {
        ...validObservation,
        latitude: 'not-a-number' as any,
      };

      await expect(addObservation(invalidLatitude)).rejects.toThrow();
    });

    it('should validate longitude is a number', async () => {
      const invalidLongitude = {
        ...validObservation,
        longitude: 'not-a-number' as any,
      };

      await expect(addObservation(invalidLongitude)).rejects.toThrow();
    });

    it('should round coordinates to 4 decimals for exact precision', async () => {
      const exactObservation = {
        ...validObservation,
        latitude: 40.712834567,
        longitude: -74.006098765,
        locationPrecision: 'exact' as const,
      };

      mockRef.mockReturnValue({} as any);
      mockUploadBytes.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue('https://example.com/image.jpg');
      mockAddDoc.mockResolvedValue({ id: 'test-doc-id' } as any);

      await addObservation(exactObservation);

      const callArgs = mockAddDoc.mock.calls[0][1];
      expect(callArgs.latitude).toBe(40.7128); // 4 decimals = ±10m
      expect(callArgs.longitude).toBe(-74.0061);
      expect(callArgs.locationPrecision).toBe('exact');
    });

    it('should round coordinates to 2 decimals for approximate precision', async () => {
      const approximateObservation = {
        ...validObservation,
        latitude: 40.712834567,
        longitude: -74.006098765,
        locationPrecision: 'approximate' as const,
      };

      mockRef.mockReturnValue({} as any);
      mockUploadBytes.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue('https://example.com/image.jpg');
      mockAddDoc.mockResolvedValue({ id: 'test-doc-id' } as any);

      await addObservation(approximateObservation);

      const callArgs = mockAddDoc.mock.calls[0][1];
      expect(callArgs.latitude).toBe(40.71); // 2 decimals = ±500m
      expect(callArgs.longitude).toBe(-74.01);
      expect(callArgs.locationPrecision).toBe('approximate');
    });

    it('should round coordinates to 1 decimal for anonymous precision', async () => {
      const anonymousObservation = {
        ...validObservation,
        latitude: 40.712834567,
        longitude: -74.006098765,
        locationPrecision: 'anonymous' as const,
        isAnonymous: true,
        authorId: undefined,
      };

      mockRef.mockReturnValue({} as any);
      mockUploadBytes.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue('https://example.com/image.jpg');
      mockAddDoc.mockResolvedValue({ id: 'test-doc-id' } as any);

      await addObservation(anonymousObservation);

      const callArgs = mockAddDoc.mock.calls[0][1];
      expect(callArgs.latitude).toBe(40.7); // 1 decimal = ±5km
      expect(callArgs.longitude).toBe(-74.0);
      expect(callArgs.locationPrecision).toBe('anonymous');
    });

    it('should use exact precision by default', async () => {
      const defaultPrecisionObservation = {
        latitude: 40.712834567,
        longitude: -74.006098765,
        description: 'Test observation with default precision',
        rating: 4,
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        authorId: 'test-user-123',
        // locationPrecision not specified - should default to 'exact'
      };

      mockRef.mockReturnValue({} as any);
      mockUploadBytes.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue('https://example.com/image.jpg');
      mockAddDoc.mockResolvedValue({ id: 'test-doc-id' } as any);

      await addObservation(defaultPrecisionObservation);

      const callArgs = mockAddDoc.mock.calls[0][1];
      expect(callArgs.latitude).toBe(40.7128); // Default to exact (4 decimals)
      expect(callArgs.longitude).toBe(-74.0061);
      expect(callArgs.locationPrecision).toBe('exact');
    });
  });
});
