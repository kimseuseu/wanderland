import { readFileSync } from 'fs';

// .env.local에서 DATABASE_URL 읽기
function loadEnv() {
  try {
    const content = readFileSync('.env.local', 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^(\w+)=["']?(.+?)["']?\s*$/);
      if (match) process.env[match[1]] ??= match[2];
    }
  } catch {}
}
loadEnv();

/** @type {import('drizzle-kit').Config} */
export default {
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
