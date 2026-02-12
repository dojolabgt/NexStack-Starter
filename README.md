# Dashboard Project

Multi-tenant dashboard application with admin panel and public landing page.

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Deployment Guide](#-deployment-guide)
- [Configuration](#-configuration)
- [Database Management](#-database-management)
- [Testing](#-testing)

---

## 🛠 Tech Stack

- **Frontend Dashboard**: Next.js 15, React, TailwindCSS, shadcn/ui
- **Frontend Public**: Next.js 15, React, TailwindCSS
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Auth**: JWT with HttpOnly cookies
- **Email**: Nodemailer (SMTP)
- **Storage**: Local filesystem (configurable for S3/Cloudinary)

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd dashboard
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

**Required variables to update in `.env`:**

```bash
# Database credentials
POSTGRES_PASSWORD=your-secure-password
DATABASE_PASSWORD=your-secure-password

# JWT secrets (generate strong random strings)
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Mail configuration (for password reset emails)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM="Your Name <your-email@gmail.com>"

# Frontend URLs (update for production)
FRONTEND_DASHBOARD_URL=http://localhost:3000
FRONTEND_PUBLIC_URL=http://localhost:3001
```

### 3. Start Development Environment

```bash
# Start all services with hot-reload
docker-compose -f docker-compose.dev.yml up --build
```

**Services will be available at:**
- 🎨 Dashboard: http://localhost:3000
- 🌐 Public Site: http://localhost:3001
- ⚙️ Backend API: http://localhost:4000
- 🗄️ PostgreSQL: localhost:5432

### 4. Seed Database

In a new terminal, run:

```bash
docker-compose -f docker-compose.dev.yml exec backend npm run seed
```

**Default credentials:**
- **Admin**: `admin@admin.com` / `admin123`
- **Team**: `team@team.com` / `team123`
- **Client**: `client@client.com` / `client123`

---

## 📦 Deployment Guide

### Step-by-Step Production Deployment

#### 1. Prepare Environment

```bash
# Clone repository on production server
git clone <repository-url>
cd dashboard

# Copy and configure production environment
cp .env.example .env
nano .env  # Edit with production values
```

#### 2. Update Production Variables

```bash
# Set production URLs
FRONTEND_URL=https://dashboard.yourdomain.com,https://yourdomain.com
FRONTEND_DASHBOARD_URL=https://dashboard.yourdomain.com
FRONTEND_PUBLIC_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Use strong production secrets
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
POSTGRES_PASSWORD=<strong-database-password>

# Set production mode
NODE_ENV=production
```

#### 3. Build and Start Services

```bash
# Build production images
docker-compose build

# Start services in detached mode
docker-compose up -d
```

#### 4. Run Database Migrations

```bash
# Apply all pending migrations
docker-compose exec backend npm run migration:run
```

#### 5. Seed Initial Data (First Time Only)

```bash
# Create admin, team, and client users
docker-compose exec backend npm run seed
```

#### 6. Configure Reverse Proxy (Nginx/Traefik)

**Example Nginx configuration:**

```nginx
# Dashboard (port 3000)
server {
    listen 80;
    server_name dashboard.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Public Site (port 3001)
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API (port 4000)
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 7. Setup SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d dashboard.yourdomain.com
sudo certbot --nginx -d yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

#### 8. Verify Deployment

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f frontend-public

# Test endpoints
curl https://api.yourdomain.com/health
curl https://dashboard.yourdomain.com
curl https://yourdomain.com
```

---

## ⚙️ Configuration

### Environment Variables

See [.env.example](.env.example) for all available configuration options.

**Key configurations:**

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend port | `4000` |
| `DATABASE_HOST` | PostgreSQL host | `postgres` |
| `FRONTEND_DASHBOARD_URL` | Admin dashboard URL | `http://localhost:3000` |
| `FRONTEND_PUBLIC_URL` | Public site URL | `http://localhost:3001` |
| `STORAGE_TYPE` | Storage provider | `local` |
| `BODY_PARSER_LIMIT` | Max request size | `10mb` |

### Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `MAIL_PASSWORD`

For other SMTP providers (Brevo, SendGrid, etc.):
```bash
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USER=your-api-key
MAIL_PASSWORD=your-smtp-key
```

### Storage Configuration

**Local Storage (Default):**
```bash
STORAGE_TYPE=local
```

**AWS S3 (Future):**
```bash
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

---

## 🗄️ Database Management

### Migrations

```bash
# Generate migration from entity changes
docker-compose -f docker-compose.dev.yml exec backend npm run migration:generate -- src/migrations/MigrationName

# Apply pending migrations
docker-compose -f docker-compose.dev.yml exec backend npm run migration:run

# Revert last migration
docker-compose -f docker-compose.dev.yml exec backend npm run migration:revert

# Show migration status
docker-compose -f docker-compose.dev.yml exec backend npm run migration:show
```

### Backup & Restore

**Backup:**
```bash
# Backup database
docker-compose exec postgres pg_dump -U admin dashboard_db > backup.sql

# Or with timestamp
docker-compose exec postgres pg_dump -U admin dashboard_db > backup-$(date +%Y%m%d-%H%M%S).sql
```

**Restore:**
```bash
# Restore from backup
docker-compose exec -T postgres psql -U admin dashboard_db < backup.sql
```

### Direct Database Access

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U admin dashboard_db

# Run SQL commands
docker-compose exec postgres psql -U admin dashboard_db -c "SELECT * FROM users;"
```

---

## 🧪 Testing

### Backend Tests

```bash
# Unit tests
docker-compose -f docker-compose.dev.yml exec backend npm run test

# E2E tests
docker-compose -f docker-compose.dev.yml exec backend npm run test:e2e

# Test coverage
docker-compose -f docker-compose.dev.yml exec backend npm run test:cov
```

### Frontend Tests

```bash
# Dashboard tests
cd frontend
npm run test

# Public site tests
cd frontend-public
npm run test
```

---

## 🔧 Common Commands

### Development

```bash
# Start services
docker-compose -f docker-compose.dev.yml up

# Rebuild specific service
docker-compose -f docker-compose.dev.yml up --build backend

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Stop services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v
```

### Production

```bash
# Start production
docker-compose up -d

# Update and restart
git pull
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📝 Project Structure

```
dashboard/
├── backend/              # NestJS backend API
│   ├── src/
│   │   ├── auth/        # Authentication & authorization
│   │   ├── users/       # User management
│   │   ├── mail/        # Email service
│   │   ├── storage/     # File storage
│   │   └── settings/    # App settings
│   └── Dockerfile
├── frontend/            # Next.js admin dashboard
│   ├── src/
│   │   ├── app/         # App router pages
│   │   ├── components/  # React components
│   │   └── lib/         # Utilities
│   └── Dockerfile
├── frontend-public/     # Next.js public site
│   ├── src/
│   │   ├── app/
│   │   └── components/
│   └── Dockerfile
├── docker-compose.yml           # Production config
├── docker-compose.dev.yml       # Development config
└── .env.example                 # Environment template
```

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # or :4000, :5432

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Migration Errors

```bash
# Check migration status
docker-compose exec backend npm run migration:show

# Revert and re-run
docker-compose exec backend npm run migration:revert
docker-compose exec backend npm run migration:run
```

### Email Not Sending

1. Check SMTP credentials in `.env`
2. Verify firewall allows outbound port 587
3. Check backend logs: `docker-compose logs backend`
4. Test SMTP connection manually

---

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Team Here]
