# Dashboard Project

## Development Setup

### Quick Start (Development Mode with Hot-Reload)

```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up

# Or build and start
docker-compose -f docker-compose.dev.yml up --build
```

**Features:**
- ✅ Hot-reload for backend (NestJS watch mode)
- ✅ Hot-reload for frontend (Next.js dev server)
- ✅ No need to rebuild on code changes
- ✅ Source code mounted as volumes

### Seed Database

```bash
docker-compose -f docker-compose.dev.yml exec backend npm run seed
```

### Production Build

```bash
# Use the production docker-compose
docker-compose up --build
```

## Default Credentials

After seeding the database:

- **Admin**: `admin@admin.com` / `admin123`
- **Client**: `client@client.com` / `client123`
- **Team**: `team@team.com` / `team123`

## Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432

## Database Migrations

This project uses TypeORM migrations. To manage schema changes:

```bash
# Generate a check for schema changes
# Replace 'MigrationName' with a descriptive name
docker-compose -f docker-compose.dev.yml exec backend npm run migration:generate src/migrations/MigrationName

# Apply pending migrations
docker-compose -f docker-compose.dev.yml exec backend npm run migration:run

# Revert last migration
docker-compose -f docker-compose.dev.yml exec backend npm run migration:revert
```

## Configuration

### Email (Brevo / SMTP)
Configure the following in your `.env` file to enable email notifications:

```ini
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USER=your_user
MAIL_PASSWORD=your_password
MAIL_FROM="No Reply <noreply@example.com>"
```

## Testing

### Backend Tests
```bash
# Run unit tests
docker-compose -f docker-compose.dev.yml exec backend npm run test

# Run E2E tests
docker-compose -f docker-compose.dev.yml exec backend npm run test:e2e
```

### Frontend Tests
```bash
# Run tests with Vitest (Host)
cd frontend
npm run test
```

## Tech Stack

- **Frontend**: Next.js 15, React, TailwindCSS, shadcn/ui
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Auth**: JWT with HttpOnly cookies
