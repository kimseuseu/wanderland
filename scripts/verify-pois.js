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
    if ((val.startsWith('"') && val.endsWith('"'))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

async function verify() {
  const sql = neon(process.env.DATABASE_URL);

  const summary = await sql`SELECT category, "group", COUNT(*) as count FROM pois GROUP BY category, "group" ORDER BY "group", category`;
  console.log('POI Summary:');
  let total = 0;
  for (const r of summary) {
    console.log(`  ${r.group}/${r.category}: ${r.count}`);
    total += parseInt(r.count);
  }
  console.log(`Total: ${total}`);

  const sample = await sql`SELECT id, category, label, x, y FROM pois ORDER BY id LIMIT 10`;
  console.log('\nSample POIs:');
  for (const r of sample) {
    console.log(`  [${r.id}] ${r.category} - ${r.label} (${r.x}, ${r.y})`);
  }
}

verify().catch(e => { console.error(e); process.exit(1); });
