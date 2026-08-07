import 'dotenv/config';

import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!googleClientId || !googleClientSecret) {
  console.warn('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
}

export const auth = betterAuth({
  appName: 'SubTrack',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
  secret: process.env.BETTER_AUTH_SECRET,
  database: new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  }),
  socialProviders: {
    google: {
      clientId: googleClientId || '',
      clientSecret: googleClientSecret || '',
      prompt: 'select_account',
    },
  },
  trustedOrigins: [process.env.APP_URL || 'http://localhost:3000'],
});
