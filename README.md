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

## Tech Stack

- **Frontend**: Next.js 15, React, TailwindCSS, shadcn/ui
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Auth**: JWT with HttpOnly cookies
