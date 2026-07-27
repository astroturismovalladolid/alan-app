'use client';

import React, { useState } from 'react';
import { Star, MapPin, Flag, Loader2, Trash2, Clock, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { addRating, reportObservation, unreportObservation, deleteObservation, updateDescription, type Observation } from '@/lib/observations-fetch';
import { cn } from '@/lib/utils';

interface ObservationPopupProps {
  observation: Observation;
  onRatingAdded: () => void;
  onReported: () => void;
  onDeleted: () => void;
  onDescriptionUpdated: () => void;
  authorName?: string;
}

export function ObservationPopup({ observation, onRatingAdded, onReported, onDeleted, onDescriptionUpdated, authorName }: ObservationPopupProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reportReason, setReportReason] = useState('');
  const [editedDescription, setEditedDescription] = useState(observation.description);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAuthor = user?.uid === observation.authorId;
  const ratingValues = Object.values(observation.ratings);
  const averageRating = ratingValues.length > 0
    ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
    : 0;
  const userHasRated = user?.uid ? observation.ratings[user.uid] !== undefined : false;
  const userRating = user?.uid ? observation.ratings[user.uid] : undefined;
  const userHasReported = user?.uid ? observation.reports.some(report => report.userId === user.uid) : false;

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return t('unknownDate');

    let date: Date;

    // Handle Firestore Timestamp
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (timestamp?.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return t('unknownDate');
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Relative time for recent observations
    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) {
      const unitWord = diffMins === 1 ? t('minute') : t('minutes');
      return language === 'es' || language === 'fr'
        ? `${t('ago')} ${diffMins} ${unitWord}`
        : `${diffMins} ${unitWord} ${t('ago')}`;
    }
    if (diffHours < 24) {
      const unitWord = diffHours === 1 ? t('hour') : t('hours');
      return language === 'es' || language === 'fr'
        ? `${t('ago')} ${diffHours} ${unitWord}`
        : `${diffHours} ${unitWord} ${t('ago')}`;
    }
    if (diffDays < 7) {
      const unitWord = diffDays === 1 ? t('day') : t('days');
      return language === 'es' || language === 'fr'
        ? `${t('ago')} ${diffDays} ${unitWord}`
        : `${diffDays} ${unitWord} ${t('ago')}`;
    }

    // Absolute date for older observations
    const locale = language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRatingSubmit = async () => {
    if (newRating === 0) {
      setError(t('pleaseSelectRating'));
      return;
    }

    if (!user) {
      setError(t('mustBeLoggedInToRate'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await addRating(observation.id, user.uid, newRating);

    if (result.success) {
      setSuccess(userHasRated ? t('ratingUpdated') : t('ratingAdded'));
      setShowRatingForm(false);
      setNewRating(0);
      onRatingAdded();
    } else {
      setError(result.error || t('failedToAddRating'));
    }

    setIsSubmitting(false);
  };

  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      setError(t('pleaseProvideReason'));
      return;
    }

    if (!user) {
      setError(t('mustBeLoggedInToReport'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await reportObservation(observation.id, user.uid, reportReason);

    if (result.success) {
      setSuccess(t('reportSubmitted'));
      setShowReportForm(false);
      setReportReason('');
      onReported();
    } else {
      setError(result.error || t('failedToReport'));
    }

    setIsSubmitting(false);
  };

  const handleUnreport = async () => {
    if (!user) {
      setError(t('mustBeLoggedInToReport'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await unreportObservation(observation.id, user.uid);

    if (result.success) {
      setSuccess(t('reportRemoved'));
      onReported();
    } else {
      setError(result.error || t('failedToUnreport'));
    }

    setIsSubmitting(false);
  };

  const handleDescriptionSave = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await updateDescription(observation.id, editedDescription);

    if (result.success) {
      setSuccess(t('descriptionUpdated'));
      setShowEditForm(false);
      onDescriptionUpdated();
    } else {
      setError(result.error || t('failedToUpdateDescription'));
    }

    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!user || !isAuthor) {
      setError(t('mustBeAuthorToDelete'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await deleteObservation(observation.id, observation.imageUrl);

    if (result.success) {
      setSuccess(t('observationDeleted'));
      setTimeout(() => {
        onDeleted();
      }, 1000);
    } else {
      setError(result.error || t('failedToDelete'));
      setShowDeleteConfirm(false);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="w-full">
      {/* Image */}
      <div className="relative w-full h-64 sm:h-80 bg-muted rounded-t-lg overflow-hidden flex items-center justify-center">
        <img
          src={observation.imageUrl}
          alt="Observation"
          className="max-w-full max-h-full object-contain"
          loading="lazy"
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
            {ratingValues.length > 0
              ? `${averageRating.toFixed(1)} (${ratingValues.length} ${ratingValues.length === 1 ? t('rating') : t('ratings')})`
              : t('noRatingsYet')}
          </span>
        </div>

        {/* Description */}
        {!showEditForm && <p className="text-sm text-foreground">{observation.description}</p>}

        {/* Author */}
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <span className="text-muted-foreground">{t('by')}</span>
          <span>{authorName || observation.authorName || 'Anonymous'}</span>
        </div>

        {/* Creation Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatTimestamp(observation.createdAt)}</span>
        </div>

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
            <span>{observation.reports.length} {observation.reports.length === 1 ? t('report') : t('reports')}</span>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="text-xs text-green-600 bg-green-50 dark:bg-green-950 night:bg-green-950 p-2 rounded">
            {success}
          </div>
        )}

        {/* Rating actions (only for non-authors) */}
        {!isAuthor && user && (
          <div className="space-y-2 pt-2 border-t">
            {userHasRated && !showRatingForm && !showReportForm && (
              <div className="text-xs text-muted-foreground">
                {t('yourRating')} {userRating} ⭐
              </div>
            )}
            {!showRatingForm && !showReportForm && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRatingForm(true);
                    setNewRating(userRating || 0);
                  }}
                >
                  <Star className="h-4 w-4 mr-1" />
                  {userHasRated ? t('changeRating') : t('rate')}
                </Button>
                {!userHasReported ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowReportForm(true)}
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    {t('reportBtn')}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={handleUnreport}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    <Flag className="h-4 w-4 mr-1" />
                    {t('unreportBtn')}
                  </Button>
                )}
              </div>
            )}

            {/* Rating Form */}
            {showRatingForm && (
              <div className="space-y-3">
                <div className="text-sm font-medium">{t('rateThisObservation')}</div>
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
                    {t('cancel')}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleRatingSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    {t('submitRating')}
                  </Button>
                </div>
              </div>
            )}

            {/* Report Form */}
            {showReportForm && (
              <div className="space-y-3">
                <div className="text-sm font-medium">{t('reportThisObservation')}</div>
                <Textarea
                  placeholder={t('reportPlaceholder')}
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
                    {t('cancel')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={handleReportSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    {t('submitReport')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Author actions: edit description / delete */}
        {isAuthor && (
          <div className="space-y-2 pt-2 border-t">
            {showEditForm ? (
              <div className="space-y-3">
                <div className="text-sm font-medium">{t('editDescription')}</div>
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditedDescription(observation.description);
                      setError(null);
                    }}
                    disabled={isSubmitting}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleDescriptionSave}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    {t('saveDescription')}
                  </Button>
                </div>
              </div>
            ) : !showDeleteConfirm ? (
              <>
                <div className="text-xs text-muted-foreground italic">
                  {t('thisIsYourObservation')}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowEditForm(true)}
                    disabled={isSubmitting}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    {t('editDescription')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('deleteObservation')}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="text-sm font-medium text-destructive">
                  {t('confirmDelete')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('deleteWarning')}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isSubmitting}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    {t('yesDelete')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
