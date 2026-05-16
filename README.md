# Subscription Calculator

A full-stack subscription tracking app for managing recurring services, monitoring upcoming renewals, converting currencies, and sending reminder notifications.

The project is split into two apps:

- `backend`: Express + TypeScript API with PostgreSQL
- `frontend`: Next.js + TypeScript dashboard UI with Tailwind CSS

## What the app does

This app helps you keep track of recurring subscriptions such as streaming services, cloud storage, productivity tools, newsletters, and gaming memberships.

It provides:

- A dashboard with monthly and yearly spend summaries
- Upcoming renewal visibility
- Subscription CRUD operations
- Category and template browsing
- Currency conversion for analytics
- Settings for preferred currency and notification channels
- Email and WhatsApp reminder support
- A scheduled cron job that sends reminders automatically

## Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL (`pg`)
- Zod for validation
- `node-cron` for scheduled reminders
- Nodemailer for email notifications
- WhatsApp Cloud API integration
- Exchange rate API integration

### Frontend

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- `next-themes`
- `react-hook-form`
- `zod`
- `recharts`
- `lucide-react`

## Repository Structure

```text
backend/
  src/
    config/db.ts
    cron/reminderCron.ts
    db/index.ts
    db/schema.ts
    db/seed.ts
    routes/
    services/
    index.ts
  env.example
  package.json
  tsconfig.json

frontend/
  src/
    app/
    components/
    lib/
    types/
  env.local
  package.json
  tailwind.config.ts
  tsconfig.json
```

## Core Features

### Dashboard

The dashboard shows:

- Total monthly spend
- Estimated yearly spend
- Active subscription count
- Upcoming renewals this week
- Category breakdowns
- A visual service library for browsing common subscription templates

### Subscriptions

You can:

- Add a new subscription
- Edit an existing subscription
- Delete a subscription
- Pause or cancel a subscription
- Filter and search subscriptions
- Start from a built-in template

### Categories and Templates

The app includes seeded categories such as:

- Entertainment
- Productivity
- Utilities & Storage
- Food & Lifestyle
- News & Reading
- Gaming

Each category has preloaded templates like Netflix, Spotify, Notion, GitHub, iCloud+, and others.

### Settings

User settings include:

- Preferred currency
- Email address for reminders
- WhatsApp number for reminders
- Toggle for email notifications
- Toggle for WhatsApp notifications
- Number of days before renewal to send reminders

### Notifications

The backend supports:

- Email reminders
- WhatsApp reminders
- Test notification sending from the settings page
- Daily reminder processing at 9:00 AM

### Currency Support

The backend fetches exchange rates so analytics can be normalized into the user’s preferred currency.

## How It Works

### Data flow

1. The frontend calls the backend API.
2. The backend reads and writes data in PostgreSQL.
3. Analytics queries active subscriptions and normalizes values into the preferred currency.
4. The cron job checks subscriptions every day.
5. When a subscription is near renewal, the app sends reminders based on the saved settings.

### Main backend endpoints

- `/api/subscriptions`
- `/api/categories`
- `/api/templates`
- `/api/analytics`
- `/api/settings`
- `/api/currency`
- `/api/health`

## Prerequisites

Before running the project, make sure you have:

- Node.js 18 or later
- npm
- PostgreSQL database
- A valid `DATABASE_URL`
- Optional notification credentials if you want email or WhatsApp reminders

## Environment Variables

### Backend

Create a backend `.env` file using [backend/env.example](backend/env.example).

```env
DATABASE_URL=postgresql://<user>:<password>@<endpoint>.neon.tech/<dbname>?sslmode=require
PORT=4000
GMAIL_USER=
GMAIL_APP_PASSWORD=
WHATSAPP_PHONE_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_TEMPLATE_NAME=subscription_reminder
EXCHANGE_RATE_API_KEY=
APP_URL=http://localhost:3000
```

### Frontend

Create a frontend `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

If this is not set, the frontend defaults to `http://localhost:4000`.

## Database Setup

The database schema lives in [backend/src/db/schema.ts](backend/src/db/schema.ts).
The sample data lives in [backend/src/db/seed.ts](backend/src/db/seed.ts).
Drizzle is configured through [backend/drizzle.config.ts](backend/drizzle.config.ts).

### Tables

The database includes:

- `categories`
- `subscription_templates`
- `subscriptions`
- `user_settings`
- `notification_logs`

### Suggested initialization order

1. Set `DATABASE_URL` to your Neon PostgreSQL connection string.
2. Run `npm run db:generate` from the `backend` folder to generate migrations from the Drizzle schema.
3. Run `npm run db:push` from the `backend` folder to apply the schema to Neon.
4. Run `npm run db:seed` from the `backend` folder to load the TypeScript seed data.
5. Start the backend.
6. Start the frontend.

### Modern database workflow

- `backend/src/db/schema.ts` is the single source of truth for tables, enums, indexes, and relations.
- `backend/drizzle.config.ts` tells Drizzle Kit where the schema lives and where to write migrations.
- `backend/src/db/seed.ts` replaces the old SQL seed file with typed inserts.
- `npm run db:studio` opens Drizzle Studio for inspecting Neon data during development.

## Installation

This repository has two separate apps, so install dependencies in each folder.

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Running Locally

### 1. Start the backend

```bash
cd backend
npm run dev
```

The backend runs on `http://localhost:4000` by default.

### 2. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:3000` by default.

## Available Scripts

### Backend scripts

From the `backend` folder:

- `npm run dev` - Start the API in development mode with `ts-node-dev`
- `npm run build` - Compile TypeScript to `dist`
- `npm start` - Run the compiled backend

### Frontend scripts

From the `frontend` folder:

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the app for production
- `npm start` - Start the production build
- `npm run lint` - Run Next.js linting

## Backend Architecture

### Entry point

The backend starts in [backend/src/index.ts](backend/src/index.ts).
It:

- Loads environment variables
- Configures Express
- Enables CORS and JSON parsing
- Registers all API routes
- Starts the reminder cron job
- Listens on the configured port

### Database connection

The shared PostgreSQL pool is configured in [backend/src/config/db.ts](backend/src/config/db.ts).
It is used across routes and cron jobs to execute queries efficiently.

### Scheduled reminders

The cron job in [backend/src/cron/reminderCron.ts](backend/src/cron/reminderCron.ts) runs daily at 9:00 AM.
It performs two main tasks:

- Advances overdue renewal dates for active subscriptions
- Sends reminders for subscriptions due on the configured reminder day

### Notification logging

Every sent or failed reminder is recorded in `notification_logs` so you can audit what happened later.

## API Reference

### Health check

`GET /api/health`

Returns:

```json
{
  "status": "ok",
  "timestamp": "2026-04-19T00:00:00.000Z"
}
```

### Subscriptions

- `GET /api/subscriptions` - List subscriptions
- `GET /api/subscriptions/:id` - Get one subscription
- `POST /api/subscriptions` - Create a subscription
- `PUT /api/subscriptions/:id` - Update a subscription
- `DELETE /api/subscriptions/:id` - Delete a subscription
- `PATCH /api/subscriptions/:id/status` - Update status only

Supported query params for listing:

- `category`
- `status`
- `billing_cycle`
- `search`

### Categories

- `GET /api/categories`

### Templates

- `GET /api/templates`
- `GET /api/templates?category=<id>`

### Analytics

- `GET /api/analytics/summary`
- `GET /api/analytics/upcoming?days=30`

### Settings

- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/settings/test-notification`

`test-notification` accepts:

```json
{ "type": "email" }
```

or

```json
{ "type": "whatsapp" }
```

### Currency

- `GET /api/currency/rates`

## Frontend Pages

### Dashboard

The dashboard is the landing page and shows:

- Summary metrics
- Upcoming spending indicators
- Category-based subscription cards
- Quick access to add subscriptions

### Subscriptions page

The subscriptions page lets you:

- Review all subscriptions in a table
- Open the add/edit modal
- Choose from the template library
- Change status
- Delete entries

### Settings page

The settings page lets you configure:

- Preferred currency
- Reminder email
- WhatsApp reminder destination
- Notification toggles
- Reminder lead time

## UI Notes

The frontend uses a dark glass-style interface with custom utility classes such as:

- `glass-card`
- `glass-btn`
- `glass-chip`
- `glass-reflection`
- `glow`
- `font-headline`

These are defined in [frontend/src/app/globals.css](frontend/src/app/globals.css) and used across the app layout and components.

## Troubleshooting

### Backend fails with port already in use

If you see `EADDRINUSE: address already in use :::4000`, another backend process is already running.
Stop the existing process or change `PORT` in your backend environment file.

### Frontend fails with CSS syntax errors

If Next.js reports an `Unknown word` error in `globals.css`, the stylesheet is corrupted or invalid. Recreate [frontend/src/app/globals.css](frontend/src/app/globals.css) as plain text CSS.

### Database connection issues

Check:

- `DATABASE_URL` is correct
- PostgreSQL is reachable
- SSL requirements match your host
- The schema has been created before starting the app

### Missing reminders or notifications

Verify:

- `user_settings` exists
- Email or WhatsApp settings are filled in
- Notification toggles are enabled
- The cron job is running in the backend logs

## Common Development Workflow

1. Start PostgreSQL.
2. Start the backend.
3. Start the frontend.
4. Add a few test subscriptions.
5. Configure settings.
6. Check analytics and upcoming renewals.
7. Confirm reminders are logged correctly.

## Security and Operational Notes

- Keep `.env` and `.env.local` out of version control.
- Store your email and WhatsApp credentials securely.
- Use a real PostgreSQL database for any persistent work.
- If you deploy the app, make sure the backend cron job still runs in the hosted environment.

## Suggested Next Improvements

- Add authentication for per-user subscription data
- Add edit history or audit logs for subscription changes
- Add recurring export to CSV or PDF
- Add push notifications or browser notifications
- Add multi-user support and per-user settings

## License

No license file is currently included in the repository. If you plan to share or publish this project, add one explicitly.
