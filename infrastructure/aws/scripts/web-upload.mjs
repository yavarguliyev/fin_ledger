import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, join, relative, sep } from 'node:path';

const [sourceDir, bucket, endpoint, repoRoot] = process.argv.slice(2);
const require = createRequire(`${repoRoot}/package.json`);
const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2'
};
const NEVER_CACHED = new Set(['index.html', 'config.json']);
const NO_CACHE = 'no-cache';
const IMMUTABLE = 'public, max-age=31536000, immutable';
const FALLBACK_TYPE = 'application/octet-stream';
const LOCAL_KEY = 'test';
const REGION = 'us-east-1';

const walk = dir => readdirSync(dir).flatMap(name => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

const client = new S3Client({ region: REGION, endpoint, forcePathStyle: true, credentials: { accessKeyId: LOCAL_KEY, secretAccessKey: LOCAL_KEY } });
const files = walk(sourceDir).map(path => ({ path, key: relative(sourceDir, path).split(sep).join('/') }));

for (const { path, key } of files) {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: readFileSync(path),
    ContentType: CONTENT_TYPES[extname(key)] ?? FALLBACK_TYPE,
    CacheControl: NEVER_CACHED.has(key) ? NO_CACHE : IMMUTABLE
  }));
}

const current = new Set(files.map(({ key }) => key));
const { Contents = [] } = await client.send(new ListObjectsV2Command({ Bucket: bucket }));
const stale = Contents.map(({ Key }) => Key).filter(key => !current.has(key));
if (stale.length > 0) await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: stale.map(Key => ({ Key })) } }));

console.log(`Uploaded ${files.length} file(s), removed ${stale.length} stale file(s) from ${bucket}`);
