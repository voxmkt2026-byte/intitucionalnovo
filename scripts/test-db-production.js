const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

// Manually parse .env.production.local
const envPath = path.resolve(process.cwd(), ".env.production.local");
let DATABASE_URL = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*DATABASE_URL\s*=\s*["']?(.*?)["']?\s*$/);
    if (match) {
      DATABASE_URL = match[1];
      break;
    }
  }
}

if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.production.local content or file missing");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
  try {
    const counts = await sql`
      SELECT count(*)::int as count, disponivel 
      FROM cartas_contempladas 
      GROUP BY disponivel
    `;
    console.log("Counts:", counts);

    const sample = await sql`
      SELECT id, segmento, administradora, valor_credito, entrada, disponivel 
      FROM cartas_contempladas 
      LIMIT 5
    `;
    console.log("Sample rows:", sample);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
