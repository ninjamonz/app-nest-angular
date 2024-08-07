import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
  introspect: {
    casing: 'camel',
  },
});

/**
 * ref
 * https://orm.drizzle.team/kit-docs/conf#push-and-pull
 *
 * npx drizzle-kit introspect
 */
