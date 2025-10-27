
'use server';

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
    const docRef = await addDoc(collection(db, 'observations'), {
      imageUrl,
      latitude,
      longitude,
      description,
      rating,
      createdAt: serverTimestamp(),
      authorId: authorId,
    });

    console.log('Document written with ID: ', docRef.id);
    return { success: true, docId: docRef.id };
  } catch (e) {
    console.error('Error adding document: ', e);
    return { success: false, error: 'Failed to add observation.' };
  }
}
