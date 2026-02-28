const { neon } = require('@neondatabase/serverless');

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

  console.log('[migrate] Done');
}

migrate().catch((err) => {
  console.error('[migrate] Fatal error:', err);
  process.exit(1);
});
