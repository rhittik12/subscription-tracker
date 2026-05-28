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

function normalizeDomain(rawDomain: string): string | null {
  const candidate = rawDomain.trim().toLowerCase();
  if (!candidate || candidate.length > 255) {
    return null;
  }

  try {
    const url = candidate.includes('://')
      ? new URL(candidate)
      : new URL(`https://${candidate}`);
    const hostname = url.hostname.toLowerCase();

    if (!hostname || !hostname.includes('.')) {
      return null;
    }

    if (!/^[a-z0-9.-]+$/.test(hostname)) {
      return null;
    }

    return hostname;
  } catch {
    return null;
  }
}

function fallbackSvgForDomain(domain: string): string {
  const initial = domain.charAt(0).toUpperCase() || '?';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="${domain}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="20" fill="url(#g)" />
  <text x="64" y="74" text-anchor="middle" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="#e2e8f0">${initial}</text>
</svg>`;
}

async function fetchLogoFromProviders(domain: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const providers = [
    `https://logo.clearbit.com/${domain}`,
    `https://icon.horse/icon/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ];

  for (const providerUrl of providers) {
    try {
      const response = await fetch(providerUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      if (!response.ok) {
        continue;
      }

      const contentType = response.headers.get('content-type') || 'image/png';
      if (!contentType.startsWith('image/')) {
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      return { buffer, contentType };
    } catch {
      continue;
    }
  }

  return null;
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

// GET /api/templates/logo/proxy
router.get('/logo/proxy', async (req: Request, res: Response) => {
  try {
    const domainParam = req.query.domain as string;
    if (!domainParam) {
      return res.status(400).json({ error: 'Domain parameter required' });
    }

    const domain = normalizeDomain(domainParam);
    if (!domain) {
      return res.status(400).json({ error: 'Invalid domain parameter' });
    }

    const result = await fetchLogoFromProviders(domain);
    if (result) {
      res.set('Content-Type', result.contentType);
      res.set('Cache-Control', 'public, max-age=86400');
      return res.send(result.buffer);
    }

    // Always return an image fallback so logo rendering never fails hard.
    res.set('Content-Type', 'image/svg+xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=86400');
    return res.send(fallbackSvgForDomain(domain));
  } catch (error) {
    console.error('Error fetching logo:', error);
    res.status(500).json({ error: 'Failed to fetch logo' });
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
