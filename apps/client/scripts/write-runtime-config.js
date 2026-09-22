/**
 * Writes the runtime config (config.json) into a built client, from environment variables, at deploy time.
 * The build itself stays environment-free, so one artifact can be pointed at any API.
 *
 *   API_URL=https://api.example.com/api/v1 STRIPE_PUBLISHABLE_KEY=pk_live_... node scripts/write-runtime-config.js [outputDir]
 */
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_OUTPUT_DIR = path.join(__dirname, '..', 'dist', 'demo', 'browser');
const CONFIG_FILE = 'config.json';

const outputDir = process.argv[2] ?? DEFAULT_OUTPUT_DIR;
const apiUrl = process.env.API_URL;

if (!apiUrl) {
  console.error('API_URL is required to write the runtime config.');
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  console.error(`Build output not found: ${outputDir}. Run the build first.`);
  process.exit(1);
}

const config = { apiUrl, stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? '' };
fs.writeFileSync(path.join(outputDir, CONFIG_FILE), `${JSON.stringify(config, null, 2)}\n`);
console.log(`Wrote ${CONFIG_FILE} for ${apiUrl}`);
