# Favicon Cache Clearing Instructions

## For Development:
1. **Hard Refresh**: Press `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
2. **Clear Browser Cache**: 
   - Chrome: Settings > Privacy and Security > Clear browsing data > Cached images and files
   - Firefox: Settings > Privacy & Security > Clear Data > Cached Web Content
   - Safari: Develop > Empty Caches

## For Production Deployment:
1. The favicon is now properly configured in `src/app/layout.tsx`
2. The favicon file is available in both `src/app/favicon.ico` and `public/favicon.ico`
3. After deployment, users may need to hard refresh to see the new favicon

## Additional Steps:
- The favicon should now work across all browsers and devices
- If still not showing, try opening the site in an incognito/private window
- The favicon will be served from `/favicon.ico` route

## Files Updated:
- `src/app/layout.tsx` - Added explicit favicon metadata configuration
- `public/favicon.ico` - Copied favicon to public directory for better compatibility
