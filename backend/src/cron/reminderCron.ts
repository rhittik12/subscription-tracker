import cron from 'node-cron';
import pool from '../config/db';
import { sendEmail } from '../services/emailService';
import { sendWhatsApp } from '../services/whatsappService';

async function advancePastDueRenewals(): Promise<void> {
  try {
    const pastDue = await pool.query(
      "SELECT * FROM subscriptions WHERE status = 'active' AND next_renewal_date < CURRENT_DATE"
    );

    for (const sub of pastDue.rows) {
      let interval: string;
      switch (sub.billing_cycle) {
        case 'weekly': interval = '7 days'; break;
        case 'monthly': interval = '1 month'; break;
        case 'quarterly': interval = '3 months'; break;
        case 'yearly': interval = '1 year'; break;
        default: interval = '1 month';
      }

      // Keep advancing until the renewal date is in the future
      await pool.query(
        `UPDATE subscriptions
         SET next_renewal_date = (
           SELECT MIN(d) FROM generate_series(
             next_renewal_date, CURRENT_DATE + INTERVAL '${interval}', INTERVAL '${interval}'
           ) AS d WHERE d >= CURRENT_DATE
         ), updated_at = NOW()
         WHERE id = $1`,
        [sub.id]
      );
    }

    if (pastDue.rows.length > 0) {
      console.log(`Advanced ${pastDue.rows.length} past-due renewal dates`);
    }
  } catch (error) {
    console.error('Error advancing past-due renewals:', error);
  }
}

async function sendReminders(): Promise<void> {
  try {
    // Get user settings
    const settingsResult = await pool.query('SELECT * FROM user_settings LIMIT 1');
    const settings = settingsResult.rows[0];

    if (!settings) {
      console.log('No user settings found, skipping reminders');
      return;
    }

    const reminderDays = settings.reminder_days_before || 7;

    // Find subscriptions due for reminder
    const subsResult = await pool.query(
      `SELECT s.*, c.name as category_name
       FROM subscriptions s
       JOIN categories c ON s.category_id = c.id
       WHERE s.status = 'active'
         AND s.next_renewal_date = CURRENT_DATE + $1 * INTERVAL '1 day'`,
      [reminderDays]
    );

    for (const sub of subsResult.rows) {
      const renewalDate = new Date(sub.next_renewal_date).toISOString().split('T')[0];

      // Check if already notified
      const logCheck = await pool.query(
        `SELECT id FROM notification_logs
         WHERE subscription_id = $1 AND renewal_date = $2 AND status = 'sent'`,
        [sub.id, sub.next_renewal_date]
      );

      if (logCheck.rows.length > 0) {
        continue; // Already notified
      }

      const message = `Your ${sub.name} (${sub.category_name}) subscription renews on ${renewalDate} for ${sub.amount} ${sub.currency}.`;

      // Send email
      if (settings.email_notifications && settings.email) {
        try {
          await sendEmail(settings.email, `Reminder: ${sub.name} renews in ${reminderDays} days`, message);
          await pool.query(
            `INSERT INTO notification_logs (subscription_id, type, status, renewal_date, message)
             VALUES ($1, 'email', 'sent', $2, $3)`,
            [sub.id, sub.next_renewal_date, message]
          );
          console.log(`Email reminder sent for ${sub.name}`);
        } catch (error: any) {
          await pool.query(
            `INSERT INTO notification_logs (subscription_id, type, status, renewal_date, message, error_message)
             VALUES ($1, 'email', 'failed', $2, $3, $4)`,
            [sub.id, sub.next_renewal_date, message, error.message]
          );
          console.error(`Failed to send email for ${sub.name}:`, error.message);
        }
      }

      // Send WhatsApp
      if (settings.whatsapp_notifications && settings.whatsapp_number) {
        try {
          await sendWhatsApp(
            settings.whatsapp_number,
            sub.name,
            renewalDate,
            `${sub.amount} ${sub.currency}`
          );
          await pool.query(
            `INSERT INTO notification_logs (subscription_id, type, status, renewal_date, message)
             VALUES ($1, 'whatsapp', 'sent', $2, $3)`,
            [sub.id, sub.next_renewal_date, message]
          );
          console.log(`WhatsApp reminder sent for ${sub.name}`);
        } catch (error: any) {
          await pool.query(
            `INSERT INTO notification_logs (subscription_id, type, status, renewal_date, message, error_message)
             VALUES ($1, 'whatsapp', 'failed', $2, $3, $4)`,
            [sub.id, sub.next_renewal_date, message, error.message]
          );
          console.error(`Failed to send WhatsApp for ${sub.name}:`, error.message);
        }
      }
    }

    if (subsResult.rows.length > 0) {
      console.log(`Processed ${subsResult.rows.length} reminder(s)`);
    }
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
}

export function startReminderCron(): void {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily reminder check...');
    await advancePastDueRenewals();
    await sendReminders();
  });

  console.log('Reminder cron job scheduled (daily at 9:00 AM)');
}
