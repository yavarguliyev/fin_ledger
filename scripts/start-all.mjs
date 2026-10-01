import { execSync } from 'child_process';
import concurrentlyModule from 'concurrently';

const concurrently = concurrentlyModule.default ?? concurrentlyModule;

const DEV_PORTS = [3000, 4200];

const portOwners = port => {
  try {
    return execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
};

const busy = DEV_PORTS.map(port => ({ port, pids: portOwners(port) })).filter(({ pids }) => pids.length > 0);

if (busy.length > 0) {
  busy.forEach(({ port, pids }) => {
    const owners = execSync(`ps -o pid=,command= -p ${pids.join(',')}`, { encoding: 'utf8' }).trim();
    console.error(`❌ Port ${port} is already in use by:\n${owners}`);
  });
  console.error('Another dev stack is running. Stop it first (or run: npm run dev:stop).');
  process.exit(1);
}

console.log('🏗️  Building packages...');
try {
  execSync('turbo run build --filter=./packages/* --concurrency=1 --ui=stream', { stdio: 'inherit' });
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
