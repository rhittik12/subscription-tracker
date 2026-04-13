import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface ExchangeRateCache {
  rates: Record<string, number>;
  base: string;
  lastFetched: number;
}

let rateCache: ExchangeRateCache | null = null;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// Fallback rates in case API is unavailable
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.53,
  CAD: 1.37,
  SGD: 1.34,
  AED: 3.67,
};

export async function getRates(): Promise<{ base: string; rates: Record<string, number> }> {
  // Return cached rates if still valid
  if (rateCache && Date.now() - rateCache.lastFetched < CACHE_DURATION) {
    return { base: rateCache.base, rates: rateCache.rates };
  }

  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    let url: string;

    if (apiKey) {
      url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
    } else {
      // Free endpoint (no key needed, limited)
      url = 'https://open.er-api.com/v6/latest/USD';
    }

    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data;

    if (data.result === 'success' || data.rates) {
      const rates = data.conversion_rates || data.rates;
      rateCache = {
        rates,
        base: 'USD',
        lastFetched: Date.now(),
      };
      return { base: 'USD', rates };
    }

    throw new Error('Invalid API response');
  } catch (error) {
    console.warn('Failed to fetch exchange rates, using fallback rates:', error);
    rateCache = {
      rates: FALLBACK_RATES,
      base: 'USD',
      lastFetched: Date.now() - CACHE_DURATION + 30 * 60 * 1000, // Retry in 30 mins
    };
    return { base: 'USD', rates: FALLBACK_RATES };
  }
}

export async function getExchangeRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;

  const { rates } = await getRates();

  const fromRate = rates[from.toUpperCase()];
  const toRate = rates[to.toUpperCase()];

  if (!fromRate || !toRate) {
    console.warn(`Exchange rate not found for ${from} -> ${to}, returning 1`);
    return 1;
  }

  // Convert via USD base: amount_in_to = amount_in_from * (toRate / fromRate)
  return toRate / fromRate;
}
