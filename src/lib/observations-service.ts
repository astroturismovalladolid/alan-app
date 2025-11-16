import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { z } from 'zod';

const ObservationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().min(10),
  rating: z.number().min(1).max(5),
  image: z.string(),
  authorId: z.string().optional(),
});

type ObservationInput = z.infer<typeof ObservationSchema>;

export async function addObservation(data: ObservationInput) {
  const validation = ObservationSchema.safeParse(data);

  if (!validation.success) {
    throw new Error(validation.error.message);
  }

  const { image, latitude, longitude, description, rating, authorId } = validation.data;

  try {
    // 1. Upload image to Firebase Storage
    const imageName = `observation_${Date.now()}.jpg`;
    const storageRef = ref(storage, `observations/${imageName}`);
    const uploadResult = await uploadString(storageRef, image, 'data_url');
    const imageUrl = await getDownloadURL(uploadResult.ref);

    // 2. Add observation data to Firestore
    const observationData = {
      imageUrl,
      latitude,
      longitude,
      description,
      rating,
      ratings: [rating], // Store ratings as array for averaging
      createdAt: serverTimestamp(),
      authorId: authorId,
      reports: [], // Initialize empty reports array
    };

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