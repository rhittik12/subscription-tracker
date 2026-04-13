import { Router, Request, Response } from 'express';
import pool from '../config/db';

const router = Router();

// GET /api/templates
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT t.*, c.name as category_name
      FROM subscription_templates t
      JOIN categories c ON t.category_id = c.id
    `;
    const params: any[] = [];

    if (category) {
      query += ' WHERE t.category_id = $1';
      params.push(Number(category));
    }

    query += ' ORDER BY c.name, t.name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

export default router;
