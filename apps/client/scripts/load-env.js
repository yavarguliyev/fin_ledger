const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envDevPath = path.join(__dirname, '..', '.env.development');
const envFilePath = fs.existsSync(envPath) ? envPath : fs.existsSync(envLocalPath) ? envLocalPath : fs.existsSync(envDevPath) ? envDevPath : null;

const environmentTsPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
const environmentProdTsPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

if (!envFilePath) {
  console.log('No .env file found. Using default environment values.');
  process.exit(0);
}

const envContent = fs.readFileSync(envFilePath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts
      .join('=')
      .trim()
      .replace(/^["']|["']$/g, '');
  }
});

const apiUrl = envVars.API_URL || 'http://localhost:3000/api/v1';
const wsUrl = envVars.WS_URL || 'ws://localhost:3000';
const stripePublishableKey = envVars.STRIPE_PUBLISHABLE_KEY || '';

const updateEnvironmentFile = (filePath, production) => {
  const content = `export const environment = {
  production: ${production},
  apiUrl: '${apiUrl}',
  wsUrl: '${wsUrl}',
  name: '${production ? 'production' : 'development'}',
  stripePublishableKey: '${stripePublishableKey}'
};
`;
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
};

updateEnvironmentFile(environmentTsPath, false);
updateEnvironmentFile(environmentProdTsPath, true);

console.log('Environment files updated successfully.');
