import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/observations/revalidate
 *
 * Triggers on-demand revalidation of the observations cache.
 * Call this endpoint after creating/updating/deleting observations
 * to ensure fresh data is served immediately.
 */
export async function POST() {
  try {
    // Revalidate the observations API route
    revalidatePath('/api/observations');

    // Also revalidate the home page which displays the map
    revalidatePath('/');

    return NextResponse.json({
      revalidated: true,
      now: Date.now()
    });
  } catch (error) {
    console.error('Error revalidating observations:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}
