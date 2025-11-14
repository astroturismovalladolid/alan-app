# Firebase Deployment Guide

## Option 1: Firebase App Hosting (Recommended)

Your application is configured with `apphosting.yaml` for Firebase App Hosting, which is optimized for Next.js applications.

### Steps to Deploy:

#### 1. Access Firebase Console
Go to [Firebase Console](https://console.firebase.google.com/)

#### 2. Create or Select Your Firebase Project
- If you don't have a project, click "Add project"
- Give it a name (e.g., "alan-light-pollution")
- Follow the setup wizard

#### 3. Set Up App Hosting

1. In the Firebase Console, navigate to **App Hosting** (in the left sidebar under "Build")
2. Click **Get Started** or **Add a backend**
3. Choose **Connect to GitHub**
4. Authorize Firebase to access your GitHub account
5. Select your repository: **alexcatesp/alan-app**
6. Select the branch: **claude/analyze-test-fix-deploy-014Sn1MhPrTKcXT1jFJh2kp6**
   - Or merge to main and use the main branch

#### 4. Configure Environment Variables

⚠️ **CRITICAL**: Set your Firebase configuration variables in App Hosting settings:

```
NEXT_PUBLIC_FIREBASE_API_KEY=<your-actual-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<your-measurement-id>
```

To get these values:
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" (</> icon) or add a new web app
4. Copy the configuration values

#### 5. Configure Firestore & Storage

1. **Enable Firestore Database**:
   - Go to **Firestore Database** in Firebase Console
   - Click **Create database**
   - Choose production mode
   - Select a location close to your users

2. **Deploy Firestore Rules**:
   - In Firestore, go to **Rules** tab
   - Copy the contents from `firestore.rules` in your repo
   - Publish the rules

3. **Enable Firebase Storage**:
   - Go to **Storage** in Firebase Console
   - Click **Get started**
   - Set up with default rules

4. **Enable Authentication**:
   - Go to **Authentication** in Firebase Console
   - Click **Get started**
   - Enable **Google** sign-in provider
   - Add authorized domains if needed

#### 6. Deploy

Once configured, Firebase App Hosting will:
- ✅ Automatically build your app on every push to the connected branch
- ✅ Run your build with the environment variables
- ✅ Deploy to a Firebase-provided URL
- ✅ Provide preview URLs for pull requests

Your app will be available at:
```
https://<backend-id>--<project-id>.web.app
```

#### 7. Set Up Custom Domain (Optional)

1. In App Hosting, go to **Domains**
2. Click **Add custom domain**
3. Follow the DNS configuration steps

---

## Option 2: Traditional Firebase Hosting (CLI Deployment)

If you prefer CLI-based deployment instead of App Hosting:

### Prerequisites
- Firebase CLI installed ✅ (already done)
- Firebase project created

### Setup Steps

1. **Login to Firebase**:
   ```bash
   firebase login
   ```

2. **Initialize Firebase Hosting**:
   ```bash
   cd /home/user/alan-app
   firebase init hosting
   ```

   Configuration:
   - Public directory: `.next` or use `out` for static export
   - Configure as single-page app: Yes
   - Set up automatic builds: No (we'll build manually)
   - Don't overwrite existing files

3. **Build the Application**:
   ```bash
   npm run build
   ```

4. **Deploy**:
   ```bash
   firebase deploy --only hosting
   ```

### Note on Next.js Features

Traditional Firebase Hosting only supports **static exports**. To use it:

1. Modify `package.json`:
   ```json
   "scripts": {
     "build": "next build && next export"
   }
   ```

2. Update `next.config.ts`:
   ```typescript
   const nextConfig: NextConfig = {
     output: 'export',
     // ... rest of config
   }
   ```

⚠️ **Limitations**: Static export doesn't support:
- Server-side rendering (SSR)
- API routes
- Server actions (your observation upload)

**Recommendation**: Stick with **Firebase App Hosting** to keep all Next.js features working, including server actions for uploading observations.

---

## Current Status

✅ Code pushed to: `claude/analyze-test-fix-deploy-014Sn1MhPrTKcXT1jFJh2kp6`
✅ Production build tested and working
✅ All tests passing (41/41)
✅ Zero security vulnerabilities
✅ `apphosting.yaml` configured

**Next Step**: Follow Option 1 above to deploy via Firebase App Hosting.

---

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Review build logs in Firebase Console
- Ensure all dependencies are in package.json

### Firebase Connection Errors
- Verify environment variables match your Firebase project
- Check Firestore rules allow authenticated access
- Ensure Storage rules allow uploads

### Authentication Issues
- Verify Google OAuth is enabled in Firebase Console
- Add your domain to authorized domains
- Check redirect URIs are configured

### Need Help?
- [Firebase App Hosting Docs](https://firebase.google.com/docs/app-hosting)
- [Next.js on Firebase](https://firebase.google.com/docs/app-hosting/frameworks/nextjs)
- Check the Firebase Console logs for detailed error messages
