const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
function loadEnvFile() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let val = trimmed.slice(eqIndex + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnvFile();

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.log('[migrate] No DATABASE_URL, skipping migration');
    return;
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`ALTER TABLE map_pins ADD COLUMN IF NOT EXISTS scenario text`;
    console.log('[migrate] Added scenario column');
  } catch (err) {
    console.log('[migrate] scenario column:', err.message);
  }

  try {
    await sql`ALTER TABLE map_pins ADD COLUMN IF NOT EXISTS server integer`;
    console.log('[migrate] Added server column');
  } catch (err) {
    console.log('[migrate] server column:', err.message);
  }

  try {
    await sql`DELETE FROM map_pins WHERE id IN (1, 2, 3, 4, 5)`;
    console.log('[migrate] Cleared old default pins');
  } catch (err) {
    console.log('[migrate] clear pins:', err.message);
  }

  try {
    await sql`ALTER TABLE blacklist ADD COLUMN IF NOT EXISTS image text`;
    console.log('[migrate] Added blacklist image column');
  } catch (err) {
    console.log('[migrate] blacklist image:', err.message);
  }

  try {
    await sql`ALTER TABLE builds ADD COLUMN IF NOT EXISTS discord_id text`;
    console.log('[migrate] Added builds discord_id column');
  } catch (err) {
    console.log('[migrate] builds discord_id:', err.message);
  }

  try {
    await sql`ALTER TABLE blacklist ADD COLUMN IF NOT EXISTS discord_id text`;
    console.log('[migrate] Added blacklist discord_id column');
  } catch (err) {
    console.log('[migrate] blacklist discord_id:', err.message);
  }

  try {
    await sql`ALTER TABLE map_pins ADD COLUMN IF NOT EXISTS discord_id text`;
    console.log('[migrate] Added map_pins discord_id column');
  } catch (err) {
    console.log('[migrate] map_pins discord_id:', err.message);
  }

  try {
    await sql`ALTER TABLE blacklist ADD COLUMN IF NOT EXISTS content text`;
    console.log('[migrate] Added blacklist content column');
  } catch (err) {
    console.log('[migrate] blacklist content:', err.message);
  }

  try {
    await sql`CREATE TABLE IF NOT EXISTS bot_channels (
      id SERIAL PRIMARY KEY,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      feature TEXT NOT NULL DEFAULT 'blacklist',
      created_at TIMESTAMP DEFAULT NOW()
    )`;
    console.log('[migrate] Created bot_channels table');
  } catch (err) {
    console.log('[migrate] bot_channels:', err.message);
  }

  console.log('[migrate] Done');
}

migrate().catch((err) => {
  console.error('[migrate] Fatal error:', err);
  process.exit(1);
});
