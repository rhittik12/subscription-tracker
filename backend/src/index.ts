import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import subscriptionRoutes from './routes/subscriptions.js';
import categoryRoutes from './routes/categories.js';
import templateRoutes from './routes/templates.js';
import analyticsRoutes from './routes/analytics.js';
import settingsRoutes from './routes/settings.js';
import currencyRoutes from './routes/currency.js';
import { startReminderCron } from './cron/reminderCron.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true,
}));

app.all('/api/auth/*', toNodeHandler(auth));
app.use(express.json());

// Routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/currency', currencyRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start cron job
startReminderCron();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
