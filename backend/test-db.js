import 'dotenv/config';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { PrismaClient } = pkg;
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    console.log('Testing connection...');
    const roles = await prisma.role.findMany();
    console.log('✅ Connection OK! Roles:', roles.map(r => r.name));
    
    const users = await prisma.user.findMany({ take: 3, include: { role: true } });
    console.log('✅ Users:', users.map(u => u.email + ' [' + u.role.name + ']'));
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error('Code:', e.code);
    console.error('Meta:', JSON.stringify(e.meta));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();
