import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { getExchangeRate } from '../services/currencyService';

const router = Router();

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

function toMonthlyAmount(amount: number, billingCycle: string): number {
  switch (billingCycle) {
    case 'weekly':
      return amount * (WEEKS_PER_YEAR / MONTHS_PER_YEAR);
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'yearly':
      return amount / MONTHS_PER_YEAR;
    default:
      return amount;
  }
}

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

// GET /api/analytics/summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    // Get user's preferred currency and reminder window
    const settingsResult = await pool.query(
      'SELECT preferred_currency, reminder_days_before FROM user_settings LIMIT 1'
    );
    const preferredCurrency = settingsResult.rows[0]?.preferred_currency || 'INR';
    const configuredReminderDays = Number(settingsResult.rows[0]?.reminder_days_before);
    const reminderDays = Number.isFinite(configuredReminderDays) && configuredReminderDays > 0
      ? configuredReminderDays
      : 7;

    // Get all active subscriptions
    const subsResult = await pool.query(
      `SELECT s.*, c.name as category_name
       FROM subscriptions s
       LEFT JOIN categories c ON s.category_id = c.id
       WHERE s.status = 'active'`
    );

    let totalMonthly = 0;
    let totalYearly = 0;
    let upcomingTotal = 0;

    const categoryBreakdown: Record<string, number> = {};

    for (const sub of subsResult.rows) {
      const rate = await getExchangeRate(sub.currency, preferredCurrency);
      const convertedAmount = parseFloat(sub.amount) * rate;
      const monthly = toMonthlyAmount(convertedAmount, sub.billing_cycle);

      totalMonthly += monthly;
      totalYearly += monthly * MONTHS_PER_YEAR;

      // Get category name
      const catName = sub.category_name || 'Other';
      categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + monthly;
    }

    // Count stats
    const activeCount = subsResult.rows.length;
    const weeklyResult = await pool.query(
      "SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND next_renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'"
    );
    const upcomingResult = await pool.query(
      `SELECT *
       FROM subscriptions
       WHERE status = 'active'
         AND next_renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $1 * INTERVAL '1 day'`,
      [reminderDays]
    );

    for (const sub of upcomingResult.rows) {
      const rate = await getExchangeRate(sub.currency, preferredCurrency);
      upcomingTotal += parseFloat(sub.amount) * rate;
    }

    const renewingThisWeek = parseInt(weeklyResult.rows[0].count, 10);
    const upcomingCount = upcomingResult.rows.length;

    res.json({
      total_monthly: roundCurrency(totalMonthly),
      total_yearly: roundCurrency(totalYearly),
      active_count: activeCount,
      renewing_this_week: renewingThisWeek,
      upcoming_count: upcomingCount,
      upcoming_total: roundCurrency(upcomingTotal),
      upcoming_window_days: reminderDays,
      currency: preferredCurrency,
      category_breakdown: Object.entries(categoryBreakdown).map(([name, amount]) => ({
        name,
        amount: roundCurrency(amount),
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

// GET /api/analytics/upcoming
router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string, 10) || 30;
    const result = await pool.query(
      `SELECT s.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM subscriptions s
       JOIN categories c ON s.category_id = c.id
       WHERE s.status = 'active'
         AND s.next_renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $1 * INTERVAL '1 day'
       ORDER BY s.next_renewal_date ASC`,
      [days]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming renewals:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming renewals' });
  }
});

export default router;
