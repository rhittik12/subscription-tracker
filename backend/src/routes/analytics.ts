import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { getExchangeRate } from '../services/currencyService';

const router = Router();

// GET /api/analytics/summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    // Get user's preferred currency
    const settingsResult = await pool.query('SELECT preferred_currency FROM user_settings LIMIT 1');
    const preferredCurrency = settingsResult.rows[0]?.preferred_currency || 'INR';

    // Get all active subscriptions
    const subsResult = await pool.query(
      "SELECT * FROM subscriptions WHERE status = 'active'"
    );

    let totalMonthly = 0;
    let totalYearly = 0;

    const categoryBreakdown: Record<string, number> = {};

    for (const sub of subsResult.rows) {
      const rate = await getExchangeRate(sub.currency, preferredCurrency);
      const convertedAmount = parseFloat(sub.amount) * rate;

      // Normalize to monthly
      let monthly: number;
      switch (sub.billing_cycle) {
        case 'weekly': monthly = convertedAmount * 4.33; break;
        case 'monthly': monthly = convertedAmount; break;
        case 'quarterly': monthly = convertedAmount / 3; break;
        case 'yearly': monthly = convertedAmount / 12; break;
        default: monthly = convertedAmount;
      }

      totalMonthly += monthly;
      totalYearly += monthly * 12;

      // Get category name
      const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [sub.category_id]);
      const catName = catResult.rows[0]?.name || 'Other';
      categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + monthly;
    }

    // Count stats
    const activeCount = subsResult.rows.length;
    const upcomingResult = await pool.query(
      "SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND next_renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'"
    );
    const renewingThisWeek = parseInt(upcomingResult.rows[0].count, 10);

    res.json({
      total_monthly: Math.round(totalMonthly * 100) / 100,
      total_yearly: Math.round(totalYearly * 100) / 100,
      active_count: activeCount,
      renewing_this_week: renewingThisWeek,
      currency: preferredCurrency,
      category_breakdown: Object.entries(categoryBreakdown).map(([name, amount]) => ({
        name,
        amount: Math.round(amount * 100) / 100,
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
