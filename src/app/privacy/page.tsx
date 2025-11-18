'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToLogin')}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/icon.svg" alt="ALAN" width={32} height={32} className="h-8 w-8" />
              <h1 className="font-headline text-3xl font-bold">ALAN</h1>
            </div>
            <CardTitle className="text-3xl">{t('privacyPolicyTitle')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {t('lastUpdated')}: 18 {t('ofThisApp').includes('de') ? 'de noviembre' : t('ofThisApp').includes('of') ? 'November' : 'novembre'} 2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6">
            <p className="text-base leading-relaxed">
              {t('privacyPolicyIntro')}
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('dataControllerTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {t('dataControllerText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('dataCollectedTitle')}</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('authDataTitle')}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                    {t('authDataText')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('profileDataTitle')}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                    {t('profileDataText')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('observationDataTitle')}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                    {t('observationDataText')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('interactionDataTitle')}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                    {t('interactionDataText')}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('legalBasisTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {t('legalBasisText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('purposeTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {t('purposeText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('recipientsTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {t('recipientsText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('internationalTransfersTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {t('internationalTransfersText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('retentionTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {t('retentionText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('userRightsTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {t('userRightsText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('securityTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {t('securityText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('minorsTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {t('minorsText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('complaintsTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {t('complaintsText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('updatesPrivacyTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {t('updatesPrivacyText')}
              </p>
            </section>

            <div className="pt-6 border-t">
              <Link href="/login">
                <Button className="w-full sm:w-auto">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('backToLogin')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
