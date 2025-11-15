# PWA Icons Guide

## Required Icons for Mobile

Your app needs icons in different sizes for iOS and Android. Place these files in the `public/` directory:

### Required Icon Sizes

1. **icon-16.png** (16x16) - Browser favicon
2. **icon-32.png** (32x32) - Browser favicon
3. **icon-192.png** (192x192) - Android icon, iOS touch icon
4. **icon-512.png** (512x512) - Android high-res icon
5. **apple-touch-icon.png** (180x180) - iOS home screen icon

### How to Create Icons

#### Option 1: Use an Icon Generator (Recommended)
1. Go to https://realfavicongenerator.net/
2. Upload your logo (the Aperture icon from your app)
3. Download the generated icons
4. Place them in the `public/` folder

#### Option 2: Create Manually
1. Use your logo/icon (the Aperture symbol)
2. Create a square image with:
   - Dark background (#000000)
   - White or primary color icon centered
   - Save as PNG with transparency if possible

#### Option 3: Simple Placeholder (Quick Start)
For now, you can use a simple colored square:
- Create images with the required sizes
- Use a solid color with "ALAN" text
- Replace later with proper logo

### Current Setup

The manifest.json is configured to look for:
- `/icon-192.png` - Main app icon
- `/icon-512.png` - High-res icon
- `/icon-32.png` - Small favicon
- `/icon-16.png` - Tiny favicon

### Testing

After adding icons:
1. On **Android Chrome**: Visit app → Menu → "Add to Home Screen"
2. On **iOS Safari**: Visit app → Share → "Add to Home Screen"
3. Check that the icon appears correctly on the home screen

### Notes

- Icons should have a **safe zone** (avoid putting important elements at edges)
- Android uses **maskable icons** (circular or rounded)
- iOS uses **square icons** (system applies rounded corners)
- Use **simple, recognizable designs** (the Aperture symbol is perfect)
