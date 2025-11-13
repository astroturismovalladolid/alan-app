import { addObservation } from '../observations-service';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { uploadString, getDownloadURL, ref } from 'firebase/storage';

// Mock Firebase functions
jest.mock('firebase/firestore');
jest.mock('firebase/storage');

const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockUploadString = uploadString as jest.MockedFunction<typeof uploadString>;
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
      mockUploadString.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue('https://example.com/image.jpg');
      mockAddDoc.mockResolvedValue({ id: 'test-doc-id' } as any);

      const result = await addObservation(validObservation);

      expect(result).toEqual({ success: true });
      expect(mockUploadString).toHaveBeenCalled();
      expect(mockGetDownloadURL).toHaveBeenCalled();
      expect(mockAddDoc).toHaveBeenCalled();
    });

    it('should handle storage upload errors gracefully', async () => {
      mockRef.mockReturnValue({} as any);
      mockUploadString.mockRejectedValue(new Error('Upload failed'));

      const result = await addObservation(validObservation);

      expect(result).toEqual({
        success: false,
        error: 'Failed to add observation.',
      });
    });

    it('should handle Firestore errors gracefully', async () => {
      mockRef.mockReturnValue({} as any);
      mockUploadString.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue('https://example.com/image.jpg');
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await addObservation(validObservation);

      expect(result).toEqual({
        success: false,
        error: 'Failed to add observation.',
      });
    });

    it('should accept observations without authorId', async () => {
      const observationWithoutAuthor = {
        latitude: 40.7128,
        longitude: -74.006,
        description: 'Test observation without author',
        rating: 3,
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      };

      mockRef.mockReturnValue({} as any);
      mockUploadString.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue('https://example.com/image.jpg');
      mockAddDoc.mockResolvedValue({ id: 'test-doc-id' } as any);

      const result = await addObservation(observationWithoutAuthor);

      expect(result).toEqual({ success: true });
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
  });
});
