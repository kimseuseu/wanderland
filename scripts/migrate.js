const { neon } = require('@neondatabase/serverless');

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.log('[migrate] No DATABASE_URL, skipping migration');
    return;
  }

  const sql = neon(process.env.DATABASE_URL);

  const migrations = [
    {
      name: 'add_map_pins_scenario_server',
      up: `
        ALTER TABLE map_pins ADD COLUMN IF NOT EXISTS scenario text;
        ALTER TABLE map_pins ADD COLUMN IF NOT EXISTS server integer;
      `,
    },
    {
      name: 'clear_old_default_pins',
      up: `DELETE FROM map_pins WHERE id IN (1, 2, 3, 4, 5);`,
    },
  ];

  for (const m of migrations) {
    try {
      await sql(m.up);
      console.log(`[migrate] Applied: ${m.name}`);
    } catch (err) {
      // Column already exists or other non-fatal error
      if (err.message?.includes('already exists')) {
        console.log(`[migrate] Skipped (already applied): ${m.name}`);
      } else {
        console.error(`[migrate] Error in ${m.name}:`, err.message);
      }
    }
  }

  console.log('[migrate] Done');
}

migrate().catch((err) => {
  console.error('[migrate] Fatal error:', err);
  process.exit(1);
});
