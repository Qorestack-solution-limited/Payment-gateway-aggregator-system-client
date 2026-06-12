# Railway deployment

This repository is split into two Railway services:

- Frontend: repository root
- Backend API: `api_backend_nestjs`

## Frontend service

- Root directory: repository root
- Config file: `railway.json`
- Build command: `npm run build`
- Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`

## Backend service

- Root directory: `api_backend_nestjs`
- Config file: `api_backend_nestjs/railway.json`
- Build command: `npm run prisma:generate && npm run build`
- Start command: `npm run start`

## Required environment variables

Set these on Railway, at minimum:

- Frontend: `VITE_API_URL`
- Backend: `DATABASE_URL`, `CLIENT_URL`, `JWT_SECRET`

Add provider-specific keys for any payment gateways you enable.
