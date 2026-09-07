import { Environment } from '../interfaces/env.interface';

export const ENVIRONMENT_CONSTANTS: Environment = {
  SERVER: {
    NODE_ENV: 'development',
    DEFAULT_PORT: 3000,
    DEFAULT_HOST: '0.0.0.0',
    API_PREFIX: 'api/v'
  },
  RESOURCES: {
    ADMIN: 'admin',
    AUTH: 'auth',
    GAME_EVENTS: 'game-events',
    LEDGER: 'ledgers',
    METRICS: 'metrics',
    NOTIFICATION: 'notifications',
    PAYMENT: 'payments',
    PAYMENT_METHOD: 'payment-methods',
    WALLET: 'wallets',
    WALLET_TRANSACTION: 'wallet-transactions',
    USER: 'users',
    UPLOAD: 'uploads'
  },
  VERSION: {
    V1: '1'
  },
  SWAGGER: {
    TITLE: 'Realtime Wallet Payments API',
    DESCRIPTION: 'Modular Monolith Payments API',
    VERSION: '1.0'
  },
  CORS: {
    ORIGIN: '*',
    CREDENTIALS: true
  },
  LOGGING: {
    BOOTSTRAP_CONTEXT: 'Bootstrap'
  }
} as const;
