# ViewLingo PWA Setup

This document describes the Progressive Web App (PWA) features implemented in ViewLingo.

## PWA Features Implemented

### 1. Web App Manifest
- **File**: `app/manifest.ts`
- **Purpose**: Defines how the app should behave when installed on a user's device
- **Features**:
  - App name and description
  - Display mode: standalone (removes browser UI)
  - Theme colors and background colors
  - App icons for different sizes
  - Orientation settings

### 2. Service Worker
- **File**: `public/sw.js`
- **Purpose**: Enables offline functionality and caching
- **Features**:
  - Caches app resources for offline use
  - Serves cached content when offline
  - Handles cache updates and cleanup

### 3. PWA Installation Prompt
- **File**: `app/components/PWAInstallPrompt.tsx`
- **Purpose**: Encourages users to install the app on their device
- **Features**:
  - Shows install prompt when app meets PWA criteria
  - Custom UI for better user experience
  - Handles user acceptance/dismissal

### 4. PWA Icons
- **Generated from**: `public/logo-splash.svg`
- **Required sizes**:
  - `icon-192x192.png` - Standard PWA icon
  - `icon-512x512.png` - Large PWA icon
  - `apple-touch-icon.png` - iOS home screen icon

## How to Use

### Development
1. Run the development server:
   ```bash
   npm run dev
   ```

2. The PWA features will be available in development mode

### Building for Production
1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Regenerating Icons
If you update the logo or need to regenerate icons:
```bash
npm run generate-icons
```

## PWA Testing

### Chrome DevTools
1. Open Chrome DevTools
2. Go to Application tab
3. Check:
   - Manifest section for PWA configuration
   - Service Workers section for SW registration
   - Storage section for cached resources

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run PWA audit to check:
   - Installability
   - PWA Optimized
   - Offline functionality

### Installation Testing
1. Visit the app in Chrome
2. Look for the install prompt or use the install button in the address bar
3. On mobile, use "Add to Home Screen" option

## PWA Requirements Met

- ✅ Web App Manifest
- ✅ Service Worker
- ✅ HTTPS (required for production)
- ✅ Responsive design
- ✅ App icons
- ✅ Install prompt
- ✅ Offline functionality

## Browser Support

- **Chrome**: Full PWA support
- **Firefox**: Full PWA support
- **Safari**: Limited PWA support (iOS 11.3+)
- **Edge**: Full PWA support

## Troubleshooting

### Service Worker Not Registering
- Ensure the app is served over HTTPS (required for production)
- Check browser console for errors
- Verify the service worker file is accessible at `/sw.js`

### Icons Not Showing
- Regenerate icons using `npm run generate-icons`
- Check that icon files exist in the `public/` folder
- Verify manifest.ts references the correct icon paths

### Install Prompt Not Appearing
- Ensure all PWA criteria are met
- Check that the app is not already installed
- Verify the manifest is properly configured

## Additional Resources

- [Next.js PWA Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/progressive-web-apps)
- [Web App Manifest Specification](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Best Practices](https://web.dev/progressive-web-apps/) 