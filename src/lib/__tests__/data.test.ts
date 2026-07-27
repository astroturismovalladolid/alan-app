import { mockImages } from '../data';

describe('Mock Data', () => {
  describe('mockImages', () => {
    it('should export an array of images', () => {
      expect(Array.isArray(mockImages)).toBe(true);
      expect(mockImages.length).toBeGreaterThan(0);
    });

    it('should have required properties on each image', () => {
      mockImages.forEach((image) => {
        expect(image).toHaveProperty('id');
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('location');
        expect(image).toHaveProperty('rating');
        expect(image).toHaveProperty('description');
        expect(image).toHaveProperty('author');
        expect(image).toHaveProperty('timestamp');
      });
    });

    it('should have valid rating values between 1 and 5', () => {
      mockImages.forEach((image) => {
        expect(image.rating).toBeGreaterThanOrEqual(1);
        expect(image.rating).toBeLessThanOrEqual(5);
      });
    });

    it('should have unique IDs', () => {
      const ids = mockImages.map((image) => image.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
