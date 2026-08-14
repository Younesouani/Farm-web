import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or DIRECT_URL environment variable is missing.');
}

const client = postgres(connectionString, { 
  prepare: false,
  ssl: 'require',
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
