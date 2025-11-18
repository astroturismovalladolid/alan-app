'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Download, Shield, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import { collection, query, where, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface ObservationStats {
  total: number;
  public: number;
  anonymous: number;
}

export function PrivacyDashboard() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState<ObservationStats>({ total: 0, public: 0, anonymous: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Load observation statistics
  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      setIsLoadingStats(true);
      try {
        // Query all observations by this user
        const q = query(
          collection(db, 'observations'),
          where('authorId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);

        const publicObs = querySnapshot.docs.filter(doc => !doc.data().isAnonymous).length;
        const anonymousObs = querySnapshot.docs.filter(doc => doc.data().isAnonymous).length;

        setStats({
          total: querySnapshot.size,
          public: publicObs,
          anonymous: anonymousObs,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, [user]);

  // Delete all user observations
  const handleDeleteAll = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // Query all observations by this user
      const q = query(
        collection(db, 'observations'),
        where('authorId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);

      // Delete in batches (Firestore limit: 500 operations per batch)
      const batches = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;

      querySnapshot.docs.forEach((document) => {
        currentBatch.delete(doc(db, 'observations', document.id));
        operationCount++;

        // If we reach 500 operations, start a new batch
        if (operationCount === 500) {
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      });

      // Add the last batch if it has operations
      if (operationCount > 0) {
        batches.push(currentBatch);
      }

      // Commit all batches
      await Promise.all(batches.map(batch => batch.commit()));

      toast({
        title: t('observationsDeleted'),
        description: t('allObservationsDeleted'),
      });

      // Reset stats
      setStats({ total: 0, public: 0, anonymous: 0 });
    } catch (error: any) {
      console.error('Error deleting observations:', error);
      toast({
        title: t('error'),
        description: error.message || t('failedToDelete'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export user data as JSON (GDPR Art. 20 - Right to data portability)
  const handleExportData = async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      // Gather all user data
      const userData: any = {
        exportDate: new Date().toISOString(),
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: user.metadata.creationTime,
        },
        observations: [],
        profile: null,
      };

      // Get user profile
      const profileDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
      if (!profileDoc.empty) {
        userData.profile = profileDoc.docs[0].data();
      }

      // Get all user observations
      const obsQuery = query(
        collection(db, 'observations'),
        where('authorId', '==', user.uid)
      );
      const obsSnapshot = await getDocs(obsQuery);
      userData.observations = obsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alan-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: t('dataExported'),
        description: t('dataExportedDesc'),
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: t('error'),
        description: error.message || 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{t('logInToSubmit')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          {t('privacyDashboard')}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t('manageYourAccount')}
        </p>
      </div>

      {/* Observation Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>{t('myObservations')}</CardTitle>
          <CardDescription>
            {t('totalObservations')}: {stats.total}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingStats ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  {t('publicObservations')}
                </div>
                <div className="mt-2 text-3xl font-bold">{stats.public}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  {t('anonymousObservations')}
                </div>
                <div className="mt-2 text-3xl font-bold">{stats.anonymous}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete All Observations */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            {t('deleteAllObservations')}
          </CardTitle>
          <CardDescription>
            {t('deleteWarning')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={stats.total === 0 || isDeleting}
                className="w-full sm:w-auto"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('deleteAllObservations')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('deleteAllConfirm')}
                  <br />
                  <br />
                  <strong className="text-destructive">
                    {t('deleteAllWarning').replace('{count}', stats.total.toString())}
                  </strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive hover:bg-destructive/90">
                  {t('yesDeleteAll')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Export Personal Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t('exportMyData')}
          </CardTitle>
          <CardDescription>
            {t('exportDataDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Download className="mr-2 h-4 w-4" />
            {t('downloadData')}
          </Button>
        </CardContent>
      </Card>

      {/* GDPR Information */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>RGPD Art. 20 - {t('userRightsTitle')}</strong>
          <br />
          {t('exportDataDesc')}
        </AlertDescription>
      </Alert>
    </div>
  );
}
