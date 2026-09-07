import { rmSync, existsSync, readdirSync, unlinkSync, statSync } from 'fs';
import { dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const targets = [
  'packages/shared-libs',
  'packages/storage',
  'packages/session',
  'packages/redis',
  'packages/rabbitmq',
  'packages/kafka',
  'packages/env',
  'packages/email-service',
  'packages/database',
  'packages/common',
  'apps/core-api',
  'apps/client'
];

function deleteFilesByExtension(dir, extensions) {
  if (!existsSync(dir)) return;

  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) deleteFilesByExtension(fullPath, extensions);
    else if (extensions.includes(extname(file))) unlinkSync(fullPath);
  }
}

function cleanAngularArtifacts(clientDir) {
  const angularPaths = [join(clientDir, 'dist'), join(clientDir, '.angular'), join(clientDir, 'node_modules/.cache')];

  for (const path of angularPaths) {
    if (existsSync(path)) {
      rmSync(path, { recursive: true, force: true });
    }
  }
}

for (const target of targets) {
  const srcDir = join(root, target, 'src');
  const pathsToClean = [join(root, target, 'dist'), join(root, target, '.turbo')];

  for (const path of pathsToClean) {
    if (existsSync(path)) {
      rmSync(path, { recursive: true, force: true });
    }
  }

  // Clean Angular-specific artifacts for client app
  if (target === 'apps/client') {
    cleanAngularArtifacts(join(root, target));
  }

  deleteFilesByExtension(srcDir, ['.js', '.map', '.d.ts']);
}

const rootTurbo = join(root, '.turbo');
if (existsSync(rootTurbo)) {
  rmSync(rootTurbo, { recursive: true, force: true });
}

console.log('🧹 Cleaned all build artifacts including Angular client');
