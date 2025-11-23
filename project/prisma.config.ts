import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

/**
 * Prisma 7 configuration file.
 * The datasource URL is now defined here instead of in `schema.prisma`.
 * It reads the value from the environment variable `DATABASE_URL`.
 */
export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
});
