import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const [keysFile, repoRoot, ...envFiles] = process.argv.slice(2);
const { parse } = createRequire(`${repoRoot}/package.json`)('dotenv');

const env = Object.assign({}, ...envFiles.filter(file => existsSync(file)).map(file => parse(readFileSync(file))));
const keys = readFileSync(keysFile, 'utf8').split('\n').map(key => key.trim()).filter(Boolean);
const present = keys.filter(key => env[key]);
const missing = keys.filter(key => !env[key]);

process.stdout.write(JSON.stringify(Object.fromEntries(present.map(key => [key, env[key]]))));
process.stderr.write(`Secrets loaded: ${present.length} (${present.join(', ')})\n`);
if (missing.length > 0) process.stderr.write(`Not set in ${envFiles.join(' or ')}, skipped: ${missing.join(', ')}\n`);
