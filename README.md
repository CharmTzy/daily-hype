# DailyHype

DailyHype is a restored full-stack ecommerce project with a public storefront, customer account area, and admin tools for catalog, orders, users, reviews, refunds, and delivery workflows.

## Stack

- `frontend`: Next.js 14, React 18, TypeScript, Tailwind, MUI, NextUI
- `backend`: Express, PostgreSQL, Socket.IO, Stripe, Nodemailer, Redis
- `database`: Neon Postgres via `DATABASE_URL`
- `images`: Cloudinary when configured

## What Was Restored

- Neon-ready PostgreSQL support through `DATABASE_URL`
- Recreated schema in `backend/db/schema.sql`
- Bootstrap and reset scripts for schema plus starter data
- Cloudinary-ready image handling for admin product uploads
- Safer Redis and email fallbacks so the backend can run without the old services
- Admin improvements including a real dashboard, working admin profile/settings pages, and an order detail view

## Project Structure

```text
.
|-- backend
|   |-- db/schema.sql
|   |-- routes/
|   |-- models/
|   `-- scripts/bootstrap-db.js
|-- frontend
|   |-- app/
|   |-- components/
|   `-- functions/
`-- render.yaml
```

## Prerequisites

- Node.js 18+
- npm
- A Neon database
- Optional: Cloudinary, Stripe, SMTP, Redis

## Local Setup

1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Create environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Configure backend environment values in `backend/.env`

```env
PORT=5001
FRONT_END_URL=http://localhost:3000
DATABASE_URL=postgresql://username:password@ep-example-pooler.us-east-1.aws.neon.tech/dailyhype?sslmode=require
JWT_SECRET_KEY=replace-me
JWT_REFRESH_KEY=replace-me
```

4. Configure frontend environment values in `frontend/.env`

```env
BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_APP_BACKEND_URL_SOCKET=http://localhost:5001
STRIPE_ID=pk_test_replace_me
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_APP_WEATHER_URL=
```

5. Create and seed the database

```bash
cd backend
npm run db:init
```

6. Start the backend

```bash
cd backend
npm run dev
```

7. Start the frontend

```bash
cd frontend
npm run dev
```

The app should then be available at:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`

## Database Scripts

- `npm run db:init`: create schema and seed starter data
- `npm run db:reset`: reset schema and seed data again

## Seeded Demo Accounts

The bootstrap script creates demo accounts unless you override them in `backend/.env`.

- Admin: `admin@dailyhype.local` / `ChangeMe123!`
- Customer: `customer@dailyhype.local` / `ChangeMe123!`

Change these before using the project outside local development.

## Optional Services

### Cloudinary

Configure these values in `backend/.env` to store product images in the cloud:

```env
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=
CLOUDINARY_FOLDER=daily-hype
```

If Cloudinary is configured, admin image uploads and seeded image assets can use hosted Cloudinary URLs.

### Redis

Redis is optional for local development. If it is not configured, the backend falls back gracefully instead of crashing.

### SMTP

SMTP is optional. Add your mail provider settings if you want email features enabled.

### Stripe

Add your Stripe secret key in the backend and publishable key in the frontend if you want to enable real checkout flows.

## Deployment Notes

- Deploy the frontend to Vercel or another Next.js-compatible host
- Deploy the backend to Render, Railway, Fly.io, or your own Node host
- Set the frontend `BACKEND_URL` to the deployed backend URL
- Set the backend `FRONT_END_URL` to the deployed frontend URL
- Keep Neon as the shared production database
- `render.yaml` can be used as a starting point for backend deployment on Render

## Admin Status

The admin area includes:

- Dashboard overview with live counts and quick actions
- Product, user, order, refund, cart, and review lists
- Product registration with Cloudinary-ready uploads
- Order detail view and admin statistics pages

## Team

- P2235035 Zay Yar Tun
- P2234993 Wai Yan Aung
- P2227791 Ang Wei Liang
- P2235022 Thu Htet San
- P2227915 Angie Toh Anqi
