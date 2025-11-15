'use client';

import { useEffect } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Aperture } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.556,44,29.865,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export default function LoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [error, setError] = React.useState<string | null>(null);
    const [signingIn, setSigningIn] = React.useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);


    const handleGoogleSignIn = async () => {
        try {
            setError(null);
            setSigningIn(true);
            await signInWithPopup(auth, googleProvider);
            // No router.push here. useEffect will handle it.
        } catch (error: any) {
            console.error("Error signing in with Google: ", error);

            // Show user-friendly error messages
            if (error.code === 'auth/unauthorized-domain') {
                setError('This domain is not authorized. Please add it in Firebase Console → Authentication → Settings → Authorized domains');
            } else if (error.code === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled. Please try again.');
            } else if (error.code === 'auth/popup-blocked') {
                setError('Pop-up blocked by browser. Please allow pop-ups for this site.');
            } else {
                setError(`Sign-in failed: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setSigningIn(false);
        }
    };
    
    if (loading || user) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }


    return (
        <main className="flex h-screen w-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex items-center gap-2">
                        <Aperture className="h-8 w-8 text-primary" />
                        <h1 className="font-headline text-3xl font-bold">ALAN</h1>
                    </div>
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>Sign in to continue to the ALAN platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    <Button
                        onClick={handleGoogleSignIn}
                        className="w-full"
                        size="lg"
                        disabled={signingIn}
                    >
                        {signingIn ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <GoogleIcon className="mr-2" />
                                Sign in with Google
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}