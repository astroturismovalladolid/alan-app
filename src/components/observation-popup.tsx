'use client';

import React, { useState } from 'react';
import { Star, MapPin, Flag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { addRating, reportObservation, type Observation } from '@/lib/observations-fetch';
import { cn } from '@/lib/utils';

interface ObservationPopupProps {
  observation: Observation;
  onRatingAdded: () => void;
  onReported: () => void;
}

export function ObservationPopup({ observation, onRatingAdded, onReported }: ObservationPopupProps) {
  const { user } = useAuth();
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAuthor = user?.uid === observation.authorId;
  const averageRating = observation.ratings.reduce((a, b) => a + b, 0) / observation.ratings.length;

  const handleRatingSubmit = async () => {
    if (newRating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await addRating(observation.id, newRating);

    if (result.success) {
      setSuccess('Rating added successfully!');
      setShowRatingForm(false);
      setNewRating(0);
      onRatingAdded();
    } else {
      setError(result.error || 'Failed to add rating');
    }

    setIsSubmitting(false);
  };

  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      setError('Please provide a reason for reporting');
      return;
    }

    if (!user) {
      setError('You must be logged in to report');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await reportObservation(observation.id, user.uid, reportReason);

    if (result.success) {
      setSuccess('Report submitted successfully');
      setShowReportForm(false);
      setReportReason('');
      onReported();
    } else {
      setError(result.error || 'Failed to submit report');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-sm">
      {/* Image */}
      <div className="relative w-full h-40 bg-muted rounded-t-lg overflow-hidden">
        <img
          src={observation.imageUrl}
          alt="Observation"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Rating Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'h-5 w-5',
                  star <= Math.round(averageRating)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {averageRating.toFixed(1)} ({observation.ratings.length} {observation.ratings.length === 1 ? 'rating' : 'ratings'})
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground line-clamp-3">{observation.description}</p>

        {/* Location */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            {observation.latitude.toFixed(4)}, {observation.longitude.toFixed(4)}
          </span>
        </div>

        {/* Reports counter (if any) */}
        {observation.reports.length > 0 && (
          <div className="text-xs text-orange-600 flex items-center gap-1">
            <Flag className="h-3 w-3" />
            <span>{observation.reports.length} report{observation.reports.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
            {success}
          </div>
        )}

        {/* Actions (only for non-authors) */}
        {!isAuthor && user && (
          <div className="space-y-2 pt-2 border-t">
            {!showRatingForm && !showReportForm && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRatingForm(true)}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Rate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowReportForm(true)}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Report
                </Button>
              </div>
            )}

            {/* Rating Form */}
            {showRatingForm && (
              <div className="space-y-3">
                <div className="text-sm font-medium">Rate this observation</div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-8 w-8 cursor-pointer transition-colors',
                        (hoverRating || newRating) >= star
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      )}
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowRatingForm(false);
                      setNewRating(0);
                      setError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleRatingSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    Submit Rating
                  </Button>
                </div>
              </div>
            )}

            {/* Report Form */}
            {showReportForm && (
              <div className="space-y-3">
                <div className="text-sm font-medium">Report this observation</div>
                <Textarea
                  placeholder="Please describe why you're reporting this observation..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowReportForm(false);
                      setReportReason('');
                      setError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={handleReportSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    Submit Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message for author */}
        {isAuthor && (
          <div className="text-xs text-muted-foreground italic pt-2 border-t">
            This is your observation
          </div>
        )}
      </div>
    </div>
  );
}
