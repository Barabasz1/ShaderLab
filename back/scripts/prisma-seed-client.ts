import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://admin:password123@localhost:5432/nestjs_db?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export async function disconnectPrisma() {
  await prisma.$disconnect();
  await pool.end();
}