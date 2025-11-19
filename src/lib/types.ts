export interface LightPollutionImage {
  id: string;
  url: string;
  dataAiHint: string;
  location: string;
  rating: number; // 1 to 5
  description: string;
  author: string;
  timestamp: string;
}

/**
 * Location precision levels for privacy protection
 * - exact: ±10m (4 decimal places) - Maximum scientific precision
 * - approximate: ±500m (2 decimal places) - More privacy
 * - anonymous: ±5km (1 decimal place) - Maximum privacy
 */
export type LocationPrecision = 'exact' | 'approximate' | 'anonymous';

/**
 * Observation interface for Firestore documents
 */
export interface Observation {
  id?: string;
  imageUrl: string;
  latitude: number; // Rounded based on locationPrecision
  longitude: number; // Rounded based on locationPrecision
  description: string;
  rating: number; // 1 to 5
  ratings: Record<string, number>; // Map of userId -> rating
  createdAt: any; // Firestore Timestamp
  authorId?: string; // Optional for anonymous observations
  authorName: string;
  reports: string[]; // Array of user IDs who reported this observation
  locationPrecision: LocationPrecision;
  isAnonymous: boolean;
  // Original coordinates are NOT stored for privacy reasons
}
