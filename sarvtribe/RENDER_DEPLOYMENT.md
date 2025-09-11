# Render Deployment Guide for SarvTribe

This guide will help you deploy your SarvTribe application to Render with Socket.IO support.

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **External Services**: Set up Cloudinary for image storage

## Architecture Overview

Your deployment will consist of:
- **Web Service**: Next.js application (sarvtribe-web)
- **Socket Service**: Socket.IO server (sarvtribe-socket)
- **Database**: PostgreSQL database (sarvtribe-db)

## Deployment Steps

### Method 1: Using render.yaml (Recommended)

1. **Push your code to GitHub** with the included `render.yaml` file
2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**:
   - The `render.yaml` file includes most environment variables
   - You'll need to set the following manually in the Render dashboard:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `EMAIL_SERVER_USER`
     - `EMAIL_SERVER_PASSWORD`
     - `EMAIL_FROM`
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
     - `NEXT_PUBLIC_PIXO_API_KEY` (optional)

### Method 2: Manual Setup

If you prefer to set up services manually:

#### 1. Create Database
- Go to Render Dashboard → "New +" → "PostgreSQL"
- Name: `sarvtribe-db`
- Plan: Starter (Free tier available)

#### 2. Create Socket Service
- Go to "New +" → "Web Service"
- Connect your GitHub repository
- Name: `sarvtribe-socket`
- Environment: Node
- Build Command: `npm install`
- Start Command: `node socket-server.js`
- Environment Variables:
  - `NODE_ENV`: `production`
  - `PORT`: `10000`
  - `CORS_ORIGIN`: `https://sarvtribe-web.onrender.com` (update after web service is created)

#### 3. Create Web Service
- Go to "New +" → "Web Service"
- Connect your GitHub repository
- Name: `sarvtribe-web`
- Environment: Node
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment Variables:
  - `NODE_ENV`: `production`
  - `DATABASE_URL`: (from your database service)
  - `NEXTAUTH_URL`: `https://sarvtribe-web.onrender.com`
  - `NEXTAUTH_SECRET`: (generate a random string)
  - `NEXT_PUBLIC_SOCKET_URL`: `https://sarvtribe-socket.onrender.com`
  - All other environment variables from your external services

## Environment Variables Reference

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# NextAuth
NEXTAUTH_URL=https://your-app.onrender.com
NEXTAUTH_SECRET=your-secret-key

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Socket.IO
NEXT_PUBLIC_SOCKET_URL=https://your-socket-service.onrender.com
```

### Optional Variables
```bash
# Photo Editor
NEXT_PUBLIC_PIXO_API_KEY=your-pixo-api-key
```

## Post-Deployment Steps

1. **Update CORS Origin**: After both services are deployed, update the `CORS_ORIGIN` environment variable in your socket service to match your web service URL.

2. **Database Migration**: The `render-postbuild` script will automatically run `prisma db push` to sync your database schema.

3. **Test Real-time Features**: Verify that chat and real-time updates work correctly.

## Service URLs

After deployment, your services will be available at:
- **Web App**: `https://sarvtribe-web.onrender.com`
- **Socket Server**: `https://sarvtribe-socket.onrender.com`

## Troubleshooting

### Common Issues

1. **Socket Connection Failed**:
   - Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly
   - Check that `CORS_ORIGIN` in socket service matches your web service URL
   - Ensure both services are running

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is correct
   - Check that the database service is running
   - Ensure SSL is enabled in your connection string

3. **Build Failures**:
   - Check build logs in Render dashboard
   - Verify all environment variables are set
   - Ensure your GitHub repository is accessible

4. **Authentication Issues**:
   - Verify `NEXTAUTH_URL` matches your production domain
   - Check that OAuth credentials are correct
   - Ensure redirect URLs are configured in OAuth providers

### Performance Optimization

1. **Free Tier Limitations**:
   - Services may sleep after 15 minutes of inactivity
   - Cold starts can take 30-60 seconds
   - Consider upgrading to paid plans for production use

2. **Database Optimization**:
   - Use connection pooling
   - Optimize queries
   - Consider upgrading database plan for better performance

## Monitoring

- Use Render's built-in monitoring dashboard
- Check service logs regularly
- Monitor database performance
- Set up alerts for service downtime

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **CORS**: Ensure CORS is properly configured
3. **HTTPS**: Render provides HTTPS by default
4. **Database**: Use strong passwords and enable SSL

## Scaling

When ready to scale:
1. Upgrade to paid plans for better performance
2. Use multiple instances for high availability
3. Consider using Render's managed databases
4. Implement caching strategies

## Support

- Render Documentation: [render.com/docs](https://render.com/docs)
- Render Community: [community.render.com](https://community.render.com)
- GitHub Issues: Create issues in your repository for project-specific problems
