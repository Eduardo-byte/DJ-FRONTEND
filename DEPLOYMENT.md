# Deployment Guide

This guide covers deploying the DJ Request Platform to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:

- [ ] Set up your Supabase project
- [ ] Configured Stripe account
- [ ] Set up your backend API
- [ ] All environment variables ready

## Environment Variables

Create a `.env.production` file with the following variables:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API
VITE_API_URL=https://your-api-domain.com

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

## Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

## Deployment Options

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   - Go to your project dashboard on Vercel
   - Navigate to Settings > Environment Variables
   - Add all required environment variables

4. **Configure Domain** (Optional)
   - Go to Settings > Domains
   - Add your custom domain

### Netlify

1. **Build Command**
   ```bash
   npm run build
   ```

2. **Publish Directory**
   ```
   dist
   ```

3. **Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add all required variables

### GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run build
   npm run deploy
   ```

### Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and run**
   ```bash
   docker build -t dj-platform .
   docker run -p 80:80 dj-platform
   ```

## Post-Deployment Checklist

- [ ] Test all functionality in production
- [ ] Verify environment variables are set correctly
- [ ] Check that HTTPS is enabled
- [ ] Test payment flow with Stripe test cards
- [ ] Verify Supabase connection
- [ ] Test real-time features
- [ ] Check mobile responsiveness
- [ ] Verify all external links work
- [ ] Test error handling

## Performance Optimization

### Build Optimizations

- Code splitting is handled by Vite
- Assets are automatically optimized
- Unused code is tree-shaken

### Runtime Optimizations

- Images are lazy-loaded
- API calls are cached where appropriate
- Real-time subscriptions are optimized

## Monitoring

Consider setting up:

- **Error Tracking**: Sentry or similar
- **Analytics**: Google Analytics or Plausible
- **Uptime Monitoring**: UptimeRobot or similar
- **Performance Monitoring**: Vercel Analytics or similar

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure variables are prefixed with `VITE_`
   - Check that they're set in your hosting platform
   - Restart your deployment after adding variables

2. **CORS Issues**
   - Configure your backend to allow your frontend domain
   - Check Supabase CORS settings

3. **Build Failures**
   - Check Node.js version compatibility
   - Ensure all dependencies are installed
   - Check for TypeScript errors

4. **Real-time Features Not Working**
   - Verify Supabase real-time is enabled
   - Check network connectivity
   - Verify authentication tokens

### Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Search existing [GitHub Issues](https://github.com/yourusername/dj-frontend/issues)
3. Create a new issue with detailed information

## Security Considerations

- Never commit `.env` files
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Regularly update dependencies
- Monitor for security vulnerabilities

## Backup Strategy

- Database backups are handled by Supabase
- Code is version controlled in Git
- Consider backing up user-uploaded content
- Document your deployment process
