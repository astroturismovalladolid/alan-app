import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

export interface Observation {
  id: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  description: string;
  rating: number;
  ratings: { [userId: string]: number }; // Map of userId to rating value
  authorId: string;
  createdAt: any;
  reports: Array<{
    userId: string;
    reason: string;
    timestamp: any;
  }>;
}

export async function fetchObservations(): Promise<Observation[]> {
  try {
    const observationsRef = collection(db, 'observations');
    const q = query(observationsRef);
    const querySnapshot = await getDocs(q);

    const observations: Observation[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Handle old array format and convert to object format
      let ratingsMap: { [userId: string]: number } = {};
      if (data.ratings) {
        if (Array.isArray(data.ratings)) {
          // Old format: convert first rating to author's rating
          ratingsMap[data.authorId] = data.ratings[0] || data.rating;
        } else {
          ratingsMap = data.ratings;
        }
      } else {
        // No ratings yet, use initial rating as author's rating
        ratingsMap[data.authorId] = data.rating;
      }

      // Calculate average from ratings map
      const ratingValues = Object.values(ratingsMap);
      const averageRating = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;

      observations.push({
        id: doc.id,
        imageUrl: data.imageUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
        rating: Math.round(averageRating),
        ratings: ratingsMap,
        authorId: data.authorId,
        createdAt: data.createdAt,
        reports: data.reports || [],
      });
    });

    return observations;
  } catch (error) {
    console.error('Error fetching observations:', error);
    return [];
  }
}

export async function addRating(observationId: string, userId: string, newRating: number): Promise<{ success: boolean; error?: string }> {
  try {
    const observationRef = doc(db, 'observations', observationId);
    const observationDoc = await getDoc(observationRef);

    if (!observationDoc.exists()) {
      return { success: false, error: 'Observation not found' };
    }

    const data = observationDoc.data();
    let ratingsMap: { [userId: string]: number } = {};

    // Handle old array format
    if (Array.isArray(data.ratings)) {
      ratingsMap[data.authorId] = data.ratings[0] || data.rating;
    } else {
      ratingsMap = data.ratings || {};
    }

    // Update or add user's rating (replaces previous rating if exists)
    ratingsMap[userId] = newRating;

    // Calculate new average
    const ratingValues = Object.values(ratingsMap);
    const averageRating = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;

    await updateDoc(observationRef, {
      ratings: ratingsMap,
      rating: Math.round(averageRating), // Keep as integer for color coding
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error adding rating:', error);
    return { success: false, error: error.message };
  }
}

export async function reportObservation(
  observationId: string,
  userId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const observationRef = doc(db, 'observations', observationId);

    await updateDoc(observationRef, {
      reports: arrayUnion({
        userId,
        reason,
        timestamp: new Date(),
      }),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error reporting observation:', error);
    return { success: false, error: error.message };
  }
}
