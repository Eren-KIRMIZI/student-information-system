import "dotenv/config";
import path from 'node:path';
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(import.meta.dirname, 'prisma', 'schema.prisma'),

  datasource: {
    url: env("DATABASE_URL"),
  },

  migrations: {
    path: path.join(import.meta.dirname, 'prisma', 'migrations'),
    seed: 'node ./prisma/seed.js',
  },
});
