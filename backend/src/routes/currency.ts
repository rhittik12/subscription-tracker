import { Router, Request, Response } from 'express';
import { getRates } from '../services/currencyService';

const router = Router();

// GET /api/currency/rates
router.get('/rates', async (_req: Request, res: Response) => {
  try {
    const rates = await getRates();
    res.json(rates);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

export default router;
