'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function CookiesPage() {
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
              <Lightbulb className="h-8 w-8 text-primary" />
              <h1 className="font-headline text-3xl font-bold">ALAN</h1>
            </div>
            <CardTitle className="text-3xl">{t('cookiePolicyTitle')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {t('lastUpdated')}: 18 {t('ofThisApp').includes('de') ? 'de noviembre' : t('ofThisApp').includes('of') ? 'November' : 'novembre'} 2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6">
            <p className="text-base leading-relaxed">
              {t('cookiePolicyIntro')}
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('whatAreCookiesTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                {t('whatAreCookiesText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('cookiesWeUseTitle')}</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('essentialCookiesTitle')}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                    {t('essentialCookiesText')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('analyticsCookiesTitle')}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                    {t('analyticsCookiesText')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('functionalCookiesTitle')}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                    {t('functionalCookiesText')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('thirdPartyCookiesTitle')}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                    {t('thirdPartyCookiesText')}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('manageCookiesTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                {t('manageCookiesText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('cookieConsentTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                {t('cookieConsentText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('updatesTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                {t('updatesText')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">{t('contactTitle')}</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                {t('contactText')}
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
