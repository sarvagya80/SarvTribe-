# Vercel Deployment Guide

## Prerequisites

1. **Database**: Set up a PostgreSQL database (recommended: Neon, Supabase, or Railway)
2. **Environment Variables**: Configure all required environment variables
3. **External Services**: Set up Cloudinary for image storage

## Environment Variables

Copy `env.example` to `.env.local` and fill in the following variables:

### Required Variables
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_URL`: Your production URL (e.g., https://your-app.vercel.app)
- `NEXTAUTH_SECRET`: A random secret key for NextAuth
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### Optional Variables
- `NEXT_PUBLIC_PIXO_API_KEY`: Pixo photo editor API key (fallback editor will be used if not provided)

## Deployment Steps

1. **Push to GitHub**: Ensure your code is pushed to a GitHub repository

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

3. **Configure Environment Variables**:
   - In Vercel dashboard, go to your project settings
   - Add all environment variables from the list above

4. **Deploy**:
   - Vercel will automatically build and deploy your application
   - The build process will run `prisma generate` automatically

## Important Notes

### Socket.IO Limitations
- The standalone socket server (`socket-server.js`) won't work on Vercel
- For real-time features, consider using:
  - **Pusher** (recommended)
  - **Ably**
  - **Railway** for a separate socket server
  - **Supabase Realtime**

### Database
- Ensure your database allows connections from Vercel's IP ranges
- Run `npx prisma db push` to sync your schema after deployment

### Performance Optimizations
- The app is configured with optimized image loading
- Bundle splitting is enabled for better performance
- Compression is enabled

## Troubleshooting

### Photo Editor Issues
- If Pixo fails to load, the app will automatically use the fallback editor
- Ensure `NEXT_PUBLIC_PIXO_API_KEY` is set if you want to use Pixo

### Build Failures
- Check that all environment variables are set
- Ensure your database is accessible
- Check the build logs in Vercel dashboard

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure your database provider allows external connections
- Check if SSL is required in your connection string
