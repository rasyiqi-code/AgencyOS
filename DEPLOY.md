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

### 1. Prepare for Dokploy
Ensure your repository is connected to your Dokploy panel.

### 2. Configure Environment Variables
In your Dokploy project settings, add the following environment variables:

```env
# Database (Internal Docker URL)
DATABASE_URL="postgresql://postgres:postgres_password_change_me@db:5432/agency_os?schema=public"

# Stack Auth (From Dashboard)
NEXT_PUBLIC_STACK_PROJECT_ID="your_project_id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_public_key"
STACK_SECRET_SERVER_KEY="your_secret_key"

# App
NEXT_PUBLIC_APP_URL="https://your-domain.com"
SUPER_ADMIN_ID="uuid_of_admin"

# OAuth (Optional but recommended)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
VERCEL_CLIENT_ID=""
VERCEL_CLIENT_SECRET=""
VERCEL_INTEGRATION_SLUG=""

```

### 3. Deployment Configuration (Docker Compose)
Use the following `docker-compose.yml` configuration in Dokploy. You can copy the content of `docker-compose.yml` from this repository directly.

Make sure to mount the volume correctly so your database persists:
- Volume: `postgres_data_prod` -> `/var/lib/postgresql/data`

### 4. Deploy
Click "Deploy" in Dokploy. The system will:
1. Build the Docker image (using the optimized `standalone` output).
2. Start the PostgreSQL database.
3. Automatically run migrations via `start.sh` when the app container starts.

### 5. Verify
Access your configured domain. The application should be running.

