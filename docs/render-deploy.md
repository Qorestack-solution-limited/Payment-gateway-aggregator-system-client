# Render deployment

This repository is configured for a Render blueprint with three resources:

- API service: `payorchestra-api`
- Frontend static site: `payorchestra-web`
- PostgreSQL database: `payorchestra-db`

## What the blueprint does

- Builds the Nest API from `api_backend_nestjs`
- Generates Prisma Client before the backend build
- Serves the Vite app as a static site with SPA rewrites
- Connects the backend to a managed PostgreSQL database

## Required secrets

Set this in the Render dashboard during blueprint creation:

- `JWT_SECRET`

Add any payment-provider secrets you use, such as Stripe, Paystack, PayPal, or Flutterwave keys.

## Environment links

- Frontend uses `VITE_API_URL=https://payorchestra-api.onrender.com/api/v1`
- Backend uses `CLIENT_URL=https://payorchestra-web.onrender.com`

## Backend health check

- The API exposes `GET /health` for Render health checks.
