import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { z } from 'zod';
import { LocationPrecision } from './types';
import { dataUrlToBlob, getThumbnailUrl, getImageMetadata } from '@/lib/image-utils';

const ObservationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().min(10),
  rating: z.number().min(1).max(5),
  image: z.string(),
  authorId: z.string().optional(),
  authorName: z.string().optional(),
  locationPrecision: z.enum(['exact', 'approximate', 'anonymous']).default('exact'),
  isAnonymous: z.boolean().default(false),
});

type ObservationInput = z.infer<typeof ObservationSchema>;

/**
 * Rounds GPS coordinates based on privacy precision level
 *
 * @param latitude - Original latitude
 * @param longitude - Original longitude
 * @param precision - Privacy level
 * @returns Rounded coordinates
 *
 * Precision levels:
 * - exact: 4 decimal places (±10m) - For scientific research
 * - approximate: 2 decimal places (±500m) - More privacy
 * - anonymous: 1 decimal place (±5km) - Maximum privacy
 */
function roundCoordinates(
  latitude: number,
  longitude: number,
  precision: LocationPrecision
): { latitude: number; longitude: number } {
  let decimalPlaces: number;

  switch (precision) {
    case 'exact':
      decimalPlaces = 4; // ±10m
      break;
    case 'approximate':
      decimalPlaces = 2; // ±500m
      break;
    case 'anonymous':
      decimalPlaces = 1; // ±5km
      break;
    default:
      decimalPlaces = 4;
  }

  const roundedLatitude = parseFloat(latitude.toFixed(decimalPlaces));
  const roundedLongitude = parseFloat(longitude.toFixed(decimalPlaces));

  return { latitude: roundedLatitude, longitude: roundedLongitude };
}

export async function addObservation(data: ObservationInput) {
  const validation = ObservationSchema.safeParse(data);

  if (!validation.success) {
    throw new Error(validation.error.message);
  }

  const {
    image,
    latitude,
    longitude,
    description,
    rating,
    authorId,
    authorName,
    locationPrecision,
    isAnonymous
  } = validation.data;

  try {
    // 1. Upload image to Firebase Storage with optimized cache headers
    const imageName = `observation_${Date.now()}.jpg`;
    const storageRef = ref(storage, `observations/${imageName}`);
    const imageBlob = dataUrlToBlob(image);
    const metadata = getImageMetadata('image/jpeg');

    const uploadResult = await uploadBytes(storageRef, imageBlob, metadata);
    const imageUrl = await getDownloadURL(uploadResult.ref);

    // 2. Generate thumbnail URL (Firebase extension will create this file automatically)
    const thumbnailUrl = getThumbnailUrl(imageUrl, imageName);

    // 3. Round coordinates based on privacy precision level
    const roundedCoords = roundCoordinates(latitude, longitude, locationPrecision);

    // 4. Prepare observation data
    const observationData: any = {
      imageUrl, // Original full-resolution image (for scientific downloads)
      thumbnailUrl, // Optimized thumbnail for UI display
      latitude: roundedCoords.latitude,
      longitude: roundedCoords.longitude,
      description,
      rating,
      createdAt: serverTimestamp(),
      authorName: authorName || 'Anonymous',
      reports: [], // Initialize empty reports array
      locationPrecision,
      isAnonymous,
    };

    // 4. Handle anonymous vs authenticated observations
    if (isAnonymous) {
      // Anonymous observation: no authorId, no ratings map
      observationData.ratings = {}; // Empty ratings map
    } else {
      // Authenticated observation: include authorId and initial rating
      if (!authorId) {
        throw new Error('authorId is required for non-anonymous observations');
      }
      observationData.authorId = authorId;
      observationData.ratings = { [authorId]: rating }; // Store ratings as map of userId -> rating
    }

    // 5. Add observation to Firestore
    const docRef = await addDoc(collection(db, 'observations'), observationData);
    console.log('Document written with ID: ', docRef.id);

    return { success: true };
  } catch (e: any) {
    console.error('Error adding document: ', e);

    // Provide more specific error messages
    let errorMessage = 'Failed to add observation.';
    if (e.code === 'storage/unauthorized') {
      errorMessage = 'Storage permission denied. Please enable Firebase Storage and configure security rules.';
    } else if (e.code === 'permission-denied') {
      errorMessage = 'Firestore permission denied. Please configure Firestore security rules.';
    } else if (e.message) {
      errorMessage = e.message;
    }

    return { success: false, error: errorMessage };
  }
}