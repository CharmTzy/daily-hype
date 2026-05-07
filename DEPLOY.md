# DailyHype - Deployment Guide

This project is deployed on **Vercel** for both the frontend and the backend. Vercel is free, gives sub-second cold starts (no 30-60 second wake-up like Render's free tier), and handles Next.js + Node serverless out of the box.

The split is:

- `frontend/` -> Vercel project A (Next.js)
- `backend/` -> Vercel project B (Express wrapped as a serverless function via `api/index.js`)

The Postgres database stays on Neon, Cloudinary keeps your product images, Stripe stays in test mode. None of those are deployed - they are external services you point the backend at.

---

## 1. Prerequisites

- Free [Vercel account](https://vercel.com) (sign up with GitHub)
- The repo pushed to GitHub. The Vercel UI imports straight from there.
- Your existing service credentials (already in `backend/.env` and `frontend/.env`) - you will paste these into the Vercel dashboard

If you have not already pushed your latest changes:

```bash
cd /Users/waiyan/Documents/daily-hype
git add -A
git commit -m "Prepare for Vercel deployment"
git push origin main
```

> Note: `.claude/` is gitignored so it will not ship to GitHub.

---

## 2. Deploy the Backend (Express)

The backend folder already contains:

- `api/index.js` - the Vercel serverless entry point that re-exports the Express app
- `vercel.json` - rewrites every incoming request to `api/index.js`
- Refactored upload paths that use `os.tmpdir()` on Vercel (writable) instead of the read-only project directory

### Steps

1. Go to <https://vercel.com/new> and click **Import** next to your GitHub repo.
2. On the import screen:
   - **Project Name**: `daily-hype-backend` (or whatever you like)
   - **Framework Preset**: `Other`
   - **Root Directory**: click **Edit** -> select `backend`
   - **Build Command**: leave empty
   - **Output Directory**: leave empty
   - **Install Command**: `npm install`
3. Expand **Environment Variables** and paste in everything from `backend/.env`:

   | Name | Notes |
   | --- | --- |
   | `DATABASE_URL` | Your Neon connection string |
   | `DB_SSL` | `true` |
   | `DB_CONNECTION_LIMIT` | `2` (small for serverless) |
   | `JWT_SECRET_KEY` | Existing value |
   | `JWT_REFRESH_KEY` | Existing value |
   | `FRONT_END_URL` | leave blank for now, update after frontend deploy |
   | `CLOUD_NAME` / `CLOUD_API_KEY` / `CLOUD_API_SECRET` | Cloudinary creds |
   | `STRIPE_SECRET_KEY` | Stripe test secret |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` | Optional - email features |
   | `REDIS_URL` | Optional - safe to omit |

4. Click **Deploy**. First deploy takes ~1 minute.
5. Once it is up, copy the deployment URL (e.g. `https://daily-hype-backend.vercel.app`) and try:

   ```text
   https://daily-hype-backend.vercel.app/health     -> {"status":"ok"}
   https://daily-hype-backend.vercel.app/api/products -> JSON product list
   ```

If `/health` returns 200 you are good. Save that URL - the frontend needs it.

---

## 3. Deploy the Frontend (Next.js)

1. Back in <https://vercel.com/new>, import the **same** GitHub repo a second time.
2. On the import screen:
   - **Project Name**: `daily-hype` (or whatever)
   - **Framework Preset**: Vercel auto-detects `Next.js`
   - **Root Directory**: `frontend`
   - Leave build / output / install commands at their defaults
3. Add environment variables from `frontend/.env`:

   | Name | Value |
   | --- | --- |
   | `BACKEND_URL` | `https://daily-hype-backend.vercel.app` (from step 2) |
   | `NEXT_PUBLIC_APP_BACKEND_URL_SOCKET` | Same backend URL (chat will fall back gracefully) |
   | `STRIPE_ID` | Your `pk_test_...` Stripe publishable key |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Your Google OAuth client id |
   | `NEXT_PUBLIC_APP_WEATHER_URL` | leave blank |

4. Click **Deploy**. Vercel will build and host. You will get a URL like `https://daily-hype.vercel.app`.

---

## 4. Wire the Frontend URL Back into the Backend

CORS on the backend reads `FRONT_END_URL`. After step 3:

1. Go to the **backend** Vercel project -> **Settings** -> **Environment Variables**
2. Update `FRONT_END_URL` to your frontend URL, e.g. `https://daily-hype.vercel.app`
3. Trigger a redeploy: **Deployments** tab -> latest deployment -> **... menu** -> **Redeploy**

---

## 5. Smoke Test the Deployment

Open `https://daily-hype.vercel.app` and walk through:

- Home page -> hero carousel + "Just Arrived" + "Most Popular" sections render with product images
- `/explore` -> catalog grid with filtering
- `/man`, `/woman`, `/girl`, `/boy`, `/baby` -> filtered listings
- Click a product -> detail page with size/colour pickers
- Add to cart -> `/cart` reflects the item
- `/signin` -> log in as `customer@dailyhype.local` / `ChangeMe123!`
- `/personal` -> profile loads
- Log in as `admin@dailyhype.local` / `ChangeMe123!` -> `/dashboard` shows stats, `/list/product` shows full catalog

If product images do not load, check the Vercel **Functions** logs on the backend project for upstream errors. The most common cause is missing or malformed env vars.

---

## 6. Reseeding the Database (optional)

If you ever need to wipe and reload demo data:

```bash
cd backend
npm run db:reset    # drops public schema and re-seeds 48 products + 20 users + 47 orders
```

This runs against whatever `DATABASE_URL` you have set locally. Be careful not to point it at a production database you care about.

---

## What Won't Work on Vercel Serverless

These are intentionally degraded - you can ignore them for an e-commerce demo:

- **Real-time chat (Socket.IO)**. Serverless functions cannot hold a persistent socket. The chat UI still mounts but live messages will not push. The rest of the order / refund flow is unaffected.
- **Long-running uploads**. Vercel hobby tier caps a single function at 30s. Image uploads through Cloudinary complete in well under that, so you should not hit it.

If you ever need real-time chat later, deploy the backend on a long-running host (Koyeb free tier, Railway, or Fly.io) and point `BACKEND_URL` there instead. The same `api/index.js` plus a `node server.js` will keep working.

---

## Cost

Both projects are on Vercel's **Hobby** (free) plan: unlimited builds, 100 GB-hours of function execution per month, and 100 GB bandwidth. No payment method required. If the project ever outgrows the free tier, the upgrade path is **Pro** at $20/month per member.

External services:

- **Neon Postgres** - free tier is plenty for demo traffic
- **Cloudinary** - free tier handles 25k transformations / 25 GB bandwidth per month
- **Stripe** - test mode is free forever
- **Upstash Redis** - free tier (optional, app works without it)
