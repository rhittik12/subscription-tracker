import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { sendEmail } from '../services/emailService';

const router = Router();

// GET /api/settings
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM user_settings LIMIT 1');
    if (result.rows.length === 0) {
      // Create default settings
      const insert = await pool.query(
        `INSERT INTO user_settings (preferred_currency, email, email_notifications, reminder_days_before)
         VALUES ('INR', '', true, 7)
         RETURNING *`
      );
      return res.json(insert.rows[0]);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings
router.put('/', async (req: Request, res: Response) => {
  try {
    const {
      preferred_currency,
      email,
      email_notifications,
      reminder_days_before,
    } = req.body;

    const result = await pool.query(
      `UPDATE user_settings
       SET preferred_currency = COALESCE($1, preferred_currency),
           email = COALESCE($2, email),
           email_notifications = COALESCE($3, email_notifications),
           reminder_days_before = COALESCE($4, reminder_days_before),
           updated_at = NOW()
       WHERE id = (SELECT id FROM user_settings LIMIT 1)
       RETURNING *`,
      [preferred_currency, email, email_notifications, reminder_days_before]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// POST /api/settings/test-notification
router.post('/test-notification', async (req: Request, res: Response) => {
  try {
    const { type } = req.body; // 'email'
    const settings = await pool.query('SELECT * FROM user_settings LIMIT 1');
    const userSettings = settings.rows[0];

    if (!userSettings) {
      return res.status(400).json({ error: 'Please configure your settings first' });
    }

    const testData = {
      name: 'Test Subscription',
      amount: '199.00',
      currency: userSettings.preferred_currency,
      next_renewal_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    if (type === 'email') {
      if (!userSettings.email) {
        return res.status(400).json({ error: 'Email not configured' });
      }
      await sendEmail(
        userSettings.email,
        'Test Reminder: Subscription Renewal',
        `Your ${testData.name} renews on ${testData.next_renewal_date} for ${testData.amount} ${testData.currency}.`
      );
      res.json({ message: 'Test email sent successfully' });
    } else {
      res.status(400).json({ error: 'Invalid type. Use "email" ' });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

export default router;
