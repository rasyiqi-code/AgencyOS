# Agency OS Deployment Guide

This guide describes how to deploy the Agency OS MVP to a Virtual Private Server (VPS) using Docker Compose.

## Prerequisites

1.  **VPS**: A Linux server (Ubuntu 20.04/22.04 recommended) with a public IP.
2.  **Domain**: Pointed to your VPS IP (e.g., `agency.yourdomain.com`).
3.  **Docker**: Installed on the VPS.
    - [Get Docker](https://docs.docker.com/get-docker/)
    - [Get Docker Compose](https://docs.docker.com/compose/install/)
4.  **Stack Auth Project**: A project created in [Stack Auth Dashboard](https://app.stack-auth.com/).

## Deployment Steps

### 1. Clone Repository (or Transfer Files)
SSH into your VPS and clone your repository (if hosted) or copy the files manually.
```bash
git clone <your-repo-url> agency-os
cd agency-os
```

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example` (if you created one) or your local `.env`.
```bash
nano .env
```
**Required Variables:**
```env
# Database (Internal Docker URL)
DATABASE_URL="postgresql://postgres:postgres_password_change_me@db:5432/agency_os?schema=public"

# Stack Auth (From Dashboard)
NEXT_PUBLIC_STACK_PROJECT_ID="your_project_id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_public_key"
STACK_SECRET_SERVER_KEY="your_secret_key"
```

### 3. Build & Run with Docker Compose
Run the application in detached mode. This will build the Next.js image and start the Postgres container.
```bash
docker compose up -d --build
```

### 4. Apply Database Migrations
Once the containers are running, execute the Prisma migration inside the container.
```bash
docker compose exec app bunx prisma migrate deploy
```

### 5. Verify Deployment
Access your domain or IP on port 3000 (unless you configured a reverse proxy like Nginx).
`http://<your-vps-ip>:3000`

## Maintenance

- **View Logs**: `docker compose logs -f`
- **Stop Server**: `docker compose down`
- **Update Application**: `git pull && docker compose up -d --build`
