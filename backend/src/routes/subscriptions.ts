import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { z } from 'zod';

const router = Router();

const subscriptionSchema = z.object({
  name: z.string().min(1).max(100),
  category_id: z.number().int().positive(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  billing_cycle: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  next_renewal_date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  start_date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional().nullable(),
  status: z.enum(['active', 'paused', 'cancelled']).optional(),
  notes: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  template_id: z.number().int().positive().optional().nullable(),
});

// GET /api/subscriptions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status, billing_cycle, search } = req.query;
    let query = `
      SELECT s.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM subscriptions s
      JOIN categories c ON s.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND s.category_id = $${paramIndex++}`;
      params.push(Number(category));
    }
    if (status) {
      query += ` AND s.status = $${paramIndex++}`;
      params.push(status);
    }
    if (billing_cycle) {
      query += ` AND s.billing_cycle = $${paramIndex++}`;
      params.push(billing_cycle);
    }
    if (search) {
      query += ` AND LOWER(s.name) LIKE $${paramIndex++}`;
      params.push(`%${(search as string).toLowerCase()}%`);
    }

    query += ' ORDER BY s.next_renewal_date ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// GET /api/subscriptions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM subscriptions s
       JOIN categories c ON s.category_id = c.id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// POST /api/subscriptions
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = subscriptionSchema.parse(req.body);
    const result = await pool.query(
      `INSERT INTO subscriptions (name, category_id, amount, currency, billing_cycle, next_renewal_date, start_date, status, notes, logo_url, template_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.name, data.category_id, data.amount, data.currency,
        data.billing_cycle, data.next_renewal_date, data.start_date || null,
        data.status || 'active', data.notes || null, data.logo_url || null,
        data.template_id || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// PUT /api/subscriptions/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data = subscriptionSchema.parse(req.body);
    const result = await pool.query(
      `UPDATE subscriptions
       SET name = $1, category_id = $2, amount = $3, currency = $4,
           billing_cycle = $5, next_renewal_date = $6, start_date = $7,
           status = $8, notes = $9, logo_url = $10, template_id = $11,
           updated_at = NOW()
       WHERE id = $12
       RETURNING *`,
      [
        data.name, data.category_id, data.amount, data.currency,
        data.billing_cycle, data.next_renewal_date, data.start_date || null,
        data.status || 'active', data.notes || null, data.logo_url || null,
        data.template_id || null, req.params.id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// DELETE /api/subscriptions/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM subscriptions WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json({ message: 'Subscription deleted', subscription: result.rows[0] });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

// PATCH /api/subscriptions/:id/status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['active', 'paused', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be active, paused, or cancelled' });
    }
    const result = await pool.query(
      'UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update subscription status' });
  }
});

export default router;
