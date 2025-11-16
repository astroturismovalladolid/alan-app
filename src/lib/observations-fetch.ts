import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

export interface Observation {
  id: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  description: string;
  rating: number;
  ratings: number[]; // Array of all ratings to calculate average
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
      observations.push({
        id: doc.id,
        imageUrl: data.imageUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
        rating: data.rating || data.ratings?.[0] || 1,
        ratings: data.ratings || [data.rating],
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

export async function addRating(observationId: string, newRating: number): Promise<{ success: boolean; error?: string }> {
  try {
    const observationRef = doc(db, 'observations', observationId);
    const observationDoc = await getDoc(observationRef);

    if (!observationDoc.exists()) {
      return { success: false, error: 'Observation not found' };
    }

    const data = observationDoc.data();
    const currentRatings = data.ratings || [data.rating];
    const updatedRatings = [...currentRatings, newRating];
    const averageRating = updatedRatings.reduce((a, b) => a + b, 0) / updatedRatings.length;

    await updateDoc(observationRef, {
      ratings: updatedRatings,
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
