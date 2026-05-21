import { Router, Request, Response } from 'express';
import { z } from 'zod';
import pool from '../config/db';

const router = Router();

const templateSchema = z.object({
  name: z.string().min(1).max(100),
  category_id: z.number().int().positive(),
  default_currency: z.string().length(3),
  logo_url: z.string().optional().nullable(),
  website_url: z.string().optional().nullable(),
});

async function categoryExists(categoryId: number): Promise<boolean> {
  const result = await pool.query('SELECT 1 FROM categories WHERE id = $1 LIMIT 1', [categoryId]);
  return result.rows.length > 0;
}

function isForeignKeyViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as any).code === '23503';
}

function parseTemplateId(rawId: string): number | null {
  const parsed = Number(rawId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

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

// POST /api/templates
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = templateSchema.parse(req.body);

    if (!(await categoryExists(data.category_id))) {
      return res.status(400).json({ error: 'Invalid category_id' });
    }

    const result = await pool.query(
      `INSERT INTO subscription_templates (name, category_id, default_currency, logo_url, website_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.name,
        data.category_id,
        data.default_currency,
        data.logo_url || null,
        data.website_url || null,
      ]
    );

    const template = await pool.query(
      `SELECT t.*, c.name as category_name
       FROM subscription_templates t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(template.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (isForeignKeyViolation(error)) {
      return res.status(400).json({ error: 'Invalid category_id' });
    }
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// PUT /api/templates/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const templateId = parseTemplateId(req.params.id);
    if (!templateId) {
      return res.status(400).json({ error: 'Invalid template id' });
    }

    const data = templateSchema.parse(req.body);

    if (!(await categoryExists(data.category_id))) {
      return res.status(400).json({ error: 'Invalid category_id' });
    }

    const result = await pool.query(
      `UPDATE subscription_templates
       SET name = $1,
           category_id = $2,
           default_currency = $3,
           logo_url = $4,
           website_url = $5
       WHERE id = $6
       RETURNING *`,
      [
        data.name,
        data.category_id,
        data.default_currency,
        data.logo_url || null,
        data.website_url || null,
        templateId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = await pool.query(
      `SELECT t.*, c.name as category_name
       FROM subscription_templates t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1`,
      [templateId]
    );

    res.json(template.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (isForeignKeyViolation(error)) {
      return res.status(400).json({ error: 'Invalid category_id' });
    }
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// DELETE /api/templates/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const templateId = parseTemplateId(req.params.id);
    if (!templateId) {
      return res.status(400).json({ error: 'Invalid template id' });
    }

    const result = await pool.query(
      'DELETE FROM subscription_templates WHERE id = $1 RETURNING *',
      [templateId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Template deleted', template: result.rows[0] });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router;
