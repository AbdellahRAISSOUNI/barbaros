# Vercel Deployment Guide for Barbaros App

## Environment Variables Required

Set these environment variables in your Vercel dashboard:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
NEXTAUTH_SECRET=your-secret-key-change-this-in-production  
NEXTAUTH_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

## Deployment Steps

1. **Connect to GitHub**: Link your GitHub repository to Vercel
2. **Set Environment Variables**: Add the above variables in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy

## Important Notes

- ESLint and TypeScript errors are ignored during build to prevent deployment failures
- Make sure your MongoDB cluster allows connections from all IPs (0.0.0.0/0) for Vercel
- Update NEXTAUTH_URL to your actual Vercel domain after first deployment

## Build Configuration

The project is configured with:
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`
- Framework preset: Next.js (auto-detected)

## Post-Deployment

1. Update NEXTAUTH_URL in environment variables to your actual Vercel URL
2. Test all authentication flows
3. Verify database connectivity
4. Check all API endpoints 