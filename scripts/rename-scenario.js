const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const content = fs.readFileSync(path.resolve(__dirname, '..', '.env.local'), 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let val = trimmed.slice(eqIndex + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

async function run() {
  const sql = neon(process.env.DATABASE_URL);

  // Rename manibus -> touch_of_sky
  await sql`UPDATE pois SET scenario = 'touch_of_sky' WHERE scenario = 'manibus'`;
  console.log('Renamed manibus -> touch_of_sky');

  const rows = await sql`SELECT scenario, COUNT(*) as count FROM pois GROUP BY scenario ORDER BY scenario`;
  for (const r of rows) {
    console.log(`  ${r.scenario}: ${r.count}`);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
