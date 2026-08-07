import type { PoolConfig } from 'pg';

export function getPostgresSslConfig(): PoolConfig['ssl'] {
  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, '\n');

  if (ca) {
    return {
      ca,
      rejectUnauthorized: true,
    };
  }

  return true;
}
