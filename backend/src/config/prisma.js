import 'dotenv/config';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { PrismaClient } = pkg;

const { Pool } = pg;

let prisma;

if (!globalThis._prisma) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  globalThis._prisma = new PrismaClient({ adapter });
}

prisma = globalThis._prisma;

export default prisma;
