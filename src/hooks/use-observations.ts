'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Observation } from '@/lib/observations-fetch';
import { addRating, reportObservation, unreportObservation, deleteObservation } from '@/lib/observations-fetch';

/**
 * Revalidates the server-side ISR cache for observations
 * This ensures fresh data is served after mutations
 */
async function revalidateServerCache(): Promise<void> {
  try {
    await fetch('/api/observations/revalidate', { method: 'POST' });
  } catch (error) {
    console.warn('Failed to revalidate server cache:', error);
  }
}

/**
 * Fetch observations from the API route (with ISR caching)
 *
 * This hook provides:
 * - Automatic caching (5 minutes)
 * - Background refetching
 * - Deduplication of requests
 * - Loading and error states
 *
 * Cost savings: Combines ISR (server-side) with React Query (client-side)
 * for minimal Firestore reads
 */
async function fetchObservationsFromAPI(): Promise<Observation[]> {
  const response = await fetch('/api/observations', {
    // Use default cache behavior (respects Cache-Control headers)
    cache: 'default',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch observations');
  }

  return response.json();
}

/**
 * Hook to fetch all observations
 *
 * Usage:
 * ```tsx
 * const { data: observations, isLoading, error, refetch } = useObservations();
 * ```
 */
export function useObservations() {
  return useQuery({
    queryKey: ['observations'],
    queryFn: fetchObservationsFromAPI,
    // Data is fresh for 5 minutes (matches ISR revalidation)
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Refetch on window focus for real-time feel
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to add a rating to an observation
 *
 * Usage:
 * ```tsx
 * const { mutate: addRatingMutation } = useAddRating();
 * addRatingMutation({ observationId: '123', userId: 'user1', rating: 5 });
 * ```
 */
export function useAddRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      observationId,
      userId,
      rating,
    }: {
      observationId: string;
      userId: string;
      rating: number;
    }) => addRating(observationId, userId, rating),
    // Optimistically update the cache
    onMutate: async ({ observationId, userId, rating }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['observations'] });

      // Snapshot the previous value
      const previousObservations = queryClient.getQueryData<Observation[]>(['observations']);

      // Optimistically update to the new value
      if (previousObservations) {
        queryClient.setQueryData<Observation[]>(['observations'], (old) => {
          if (!old) return old;
          return old.map((obs) => {
            if (obs.id === observationId) {
              const newRatings = { ...obs.ratings, [userId]: rating };
              const ratingValues = Object.values(newRatings);
              const averageRating = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;
              return {
                ...obs,
                ratings: newRatings,
                rating: Math.round(averageRating),
              };
            }
            return obs;
          });
        });
      }

      return { previousObservations };
    },
    // On error, rollback to previous value
    onError: (err, variables, context) => {
      if (context?.previousObservations) {
        queryClient.setQueryData(['observations'], context.previousObservations);
      }
    },
    // Always refetch after error or success
    onSettled: async () => {
      await revalidateServerCache();
      queryClient.invalidateQueries({ queryKey: ['observations'] });
    },
  });
}

/**
 * Hook to report an observation
 */
export function useReportObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      observationId,
      userId,
      reason,
    }: {
      observationId: string;
      userId: string;
      reason: string;
    }) => reportObservation(observationId, userId, reason),
    onSuccess: async () => {
      await revalidateServerCache();
      queryClient.invalidateQueries({ queryKey: ['observations'] });
    },
  });
}

/**
 * Hook to unreport an observation
 */
export function useUnreportObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ observationId, userId }: { observationId: string; userId: string }) =>
      unreportObservation(observationId, userId),
    onSuccess: async () => {
      await revalidateServerCache();
      queryClient.invalidateQueries({ queryKey: ['observations'] });
    },
  });
}

/**
 * Hook to delete an observation
 */
export function useDeleteObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ observationId, imageUrl }: { observationId: string; imageUrl: string }) =>
      deleteObservation(observationId, imageUrl),
    onSuccess: async () => {
      await revalidateServerCache();
      queryClient.invalidateQueries({ queryKey: ['observations'] });
    },
  });
}
