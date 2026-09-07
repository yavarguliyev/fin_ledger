import { execSync } from 'child_process';
import concurrentlyModule from 'concurrently';

const concurrently = concurrentlyModule.default ?? concurrentlyModule;

console.log('🏗️  Building packages...');
try {
  execSync('turbo run build --filter=./packages/*', { stdio: 'inherit' });
} catch {
  console.error('❌ Package build failed');
  process.exit(1);
}

console.log('🚀 Starting development servers...');

const commands = [
  {
    name: 'core-api',
    command: 'npm run dev -w apps/core-api',
    prefixColor: 'blue'
  },
  {
    name: 'client',
    command: 'npm run dev -w apps/client',
    prefixColor: 'green'
  }
];

const { result } = concurrently(commands, {
  prefix: '{name}',
  killOthersOn: 'failure',
  restartTries: 0,
  raw: false,
  prefixColors: ['blue', 'green']
});

result.catch(error => {
  console.error('❌ Development server failed:', error);
  process.exit(1);
});
