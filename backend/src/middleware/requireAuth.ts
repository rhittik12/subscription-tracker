import { NextFunction, Request, Response } from 'express';
import { auth } from '../auth.js';

function toWebHeaders(headers: Request['headers']): Headers {
  const webHeaders = new Headers();

  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        webHeaders.append(key, item);
      }
      continue;
    }

    webHeaders.set(key, value);
  }

  return webHeaders;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: toWebHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.locals.session = session;
    next();
  } catch (error) {
    console.error('Error validating session:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
}
