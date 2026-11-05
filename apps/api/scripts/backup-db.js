require('dotenv/config');
const { Client } = require('pg');
const fs = require('fs');
const os = require('os');
const path = require('path');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const t = await c.query("select table_name from information_schema.tables where table_schema='public' order by table_name");
  const out = { createdAt: new Date().toISOString(), tables: {} };
  for (const r of t.rows) {
    const d = await c.query('select * from "' + r.table_name + '"');
    out.tables[r.table_name] = d.rows;
  }
  await c.end();
  const dir = path.join(os.homedir(), 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, 'db-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');
  fs.writeFileSync(f, JSON.stringify(out, null, 2), { mode: 0o600 });
  console.log('saved:', f);
  for (const k in out.tables) console.log(k, out.tables[k].length, 'rows');
})().catch((e) => { console.log('ERR:', e.message); process.exit(1); });
