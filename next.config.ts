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

// Scoped to this app's real origins: Firebase Auth/Firestore/Storage,
// Google Sign-In, and the Leaflet/OSM/CARTO map tiles + unpkg marker
// icons used in src/components/map.tsx. Google domains are wildcarded
// (*.googleapis.com etc.) rather than enumerated host-by-host because
// Firebase Auth's popup flow (signInWithPopup in src/app/login/page.tsx)
// touches several of them and under-scoping would silently break login.
//
// NOTE: this couldn't be verified against a live Google Sign-In flow in
// the environment this was written in (no real Firebase project
// credentials available there) — re-check the browser console for
// CSP violations after the first deploy with real credentials.
const isDev = process.env.NODE_ENV !== 'production';
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''} https://*.googleapis.com https://*.gstatic.com https://apis.google.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.googleapis.com https://*.google.com https://*.gstatic.com wss://*.firebaseio.com https://*.firebaseio.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com",
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), geolocation=(self), microphone=()' },
];

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
  // Aggressive caching headers to reduce Firebase costs
  async headers() {
    return [
      // Baseline security headers, applied to every route.
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Cache static assets (JS, CSS, fonts, images) for 1 year
      {
        source: '/(.*)\\.(js|css|woff|woff2|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache Next.js static chunks for 1 year
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache public folder assets for 1 year
      {
        source: '/icon-:size(.*).png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache API responses for 5 minutes with stale-while-revalidate
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
