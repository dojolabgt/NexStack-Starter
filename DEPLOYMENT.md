# 🚀 Deployment Guide - Dokploy

## Prerequisites

- Dokploy instance running
- Domain name configured (e.g., `dashboard.yourdomain.com`)
- GitHub repository pushed

## Step 1: Prepare Environment Variables

1. **Generate secure secrets**:
   ```bash
   # Generate JWT_SECRET
   openssl rand -base64 32
   
   # Generate JWT_REFRESH_SECRET
   openssl rand -base64 32
   ```

2. **Copy the secrets** - You'll need them for Dokploy

## Step 2: Create Application in Dokploy

### 2.1 Create New Application

1. Go to your Dokploy dashboard
2. Click **"Create Application"**
3. Choose **"Docker Compose"**
4. Connect your GitHub repository: `https://github.com/dojolabgt/dashboard`
5. Select branch: `main`

### 2.2 Configure Docker Compose

Dokploy will automatically detect `docker-compose.yml`. Make sure it's using the production file.

### 2.3 Set Environment Variables

In Dokploy, add these environment variables:

> [!CAUTION]
> **CRITICAL**: You MUST set `NEXT_PUBLIC_API_URL` BEFORE deploying. This variable is embedded at build time and cannot be changed after deployment without rebuilding.

#### Database
```
POSTGRES_USER=admin
POSTGRES_PASSWORD=<SECURE_PASSWORD>
POSTGRES_DB=dashboard_production
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=<SAME_AS_POSTGRES_PASSWORD>
DATABASE_NAME=dashboard_production
```

#### Backend
```
PORT=4000
NODE_ENV=production
JWT_SECRET=<YOUR_GENERATED_SECRET_1>
JWT_REFRESH_SECRET=<YOUR_GENERATED_SECRET_2>
```

#### Frontend (CRITICAL - Set BEFORE first deploy)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

> [!IMPORTANT]
> Replace `yourdomain.com` with your actual domain. The `NEXT_PUBLIC_API_URL` must match the domain you configure in step 2.4.

#### Storage
```
STORAGE_TYPE=local
UPLOAD_MAX_SIZE=5242880
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp,gif
```

### 2.4 Configure Domains

> [!WARNING]
> Configure domains BEFORE setting environment variables, so you know the correct URLs to use.

## Step 3: Configure Domains

### 3.1 Backend API
- **Service**: `backend`
- **Domain**: `api.yourdomain.com`
- **Port**: `4000`
- **Enable HTTPS**: ✅

### 3.2 Frontend
- **Service**: `frontend`
- **Domain**: `yourdomain.com` (or `dashboard.yourdomain.com`)
- **Port**: `3000`
- **Enable HTTPS**: ✅

## Step 4: Configure Volumes (Important!)

Make sure these volumes are persistent in Dokploy:

```yaml
volumes:
  postgres_data:
  uploads:
```

This ensures your database and uploaded files persist across deployments.

## Step 5: Deploy

1. Click **"Deploy"** in Dokploy
2. Wait for the build to complete (~3-5 minutes)
3. Check logs for any errors

## Step 6: Initial Setup

1. **Access your frontend**: `https://yourdomain.com`
2. **Login with default admin**:
   - Email: `admin@example.com`
   - Password: `admin123`
3. **IMMEDIATELY change the password** in settings
4. **Configure app settings**:
   - Upload logo
   - Upload favicon
   - Set app name

## Troubleshooting

### Build fails
- Check environment variables are set correctly
- Verify GitHub repository is accessible
- Check Dokploy logs

### Database connection error
- Verify `DATABASE_HOST=postgres` (service name)
- Check database credentials match
- Ensure postgres service is running

### CORS errors
- Verify `FRONTEND_URL` matches your actual domain
- Check `NEXT_PUBLIC_API_URL` is correct
- Ensure HTTPS is enabled on both domains

### Images not loading
- Check uploads volume is mounted
- Verify `NEXT_PUBLIC_API_URL` is accessible
- Check CORS headers in backend

## Post-Deployment Checklist

- [ ] Changed default admin password
- [ ] Configured app name and branding
- [ ] Tested user creation
- [ ] Tested file uploads
- [ ] Verified HTTPS is working
- [ ] Set up backups for postgres_data volume
- [ ] Set up backups for uploads volume

## Backup Strategy

### Database Backup
```bash
docker exec dashboard-postgres-1 pg_dump -U admin dashboard_production > backup.sql
```

### Uploads Backup
```bash
docker cp dashboard-backend-1:/app/uploads ./uploads-backup
```

## Monitoring

- Check Dokploy logs regularly
- Monitor disk space (uploads can grow)
- Set up alerts for service downtime

## Support

If you encounter issues:
1. Check Dokploy logs
2. Check application logs in Dokploy
3. Verify environment variables
4. Check domain DNS configuration
