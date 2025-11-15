import type {NextConfig} from 'next';

// Parse Firebase config from App Hosting if available
let firebaseEnv = {};
if (process.env.FIREBASE_WEBAPP_CONFIG) {
  try {
    const config = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
    firebaseEnv = {
      NEXT_PUBLIC_FIREBASE_API_KEY: config.apiKey,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: config.authDomain,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: config.projectId,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: config.storageBucket,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: config.messagingSenderId,
      NEXT_PUBLIC_FIREBASE_APP_ID: config.appId,
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: config.measurementId || '',
    };
  } catch (e) {
    console.warn('Failed to parse FIREBASE_WEBAPP_CONFIG:', e);
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  env: firebaseEnv,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
