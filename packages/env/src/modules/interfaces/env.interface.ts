export interface Environment {
  SERVER: {
    NODE_ENV: 'development' | 'production';
    DEFAULT_PORT: 3000;
    DEFAULT_HOST: '0.0.0.0';
    API_PREFIX: 'api/v';
  };
  RESOURCES: {
    ADMIN: 'admin';
    AUTH: 'auth';
    GAME_EVENTS: 'game-events';
    LEDGER: 'ledgers';
    METRICS: 'metrics';
    NOTIFICATION: 'notifications';
    PAYMENT: 'payments';
    PAYMENT_METHOD: 'payment-methods';
    WALLET: 'wallets';
    WALLET_TRANSACTION: 'wallet-transactions';
    USER: 'users';
    UPLOAD: 'uploads';
  };
  VERSION: {
    V1: '1';
  };
  SWAGGER: {
    TITLE: string;
    DESCRIPTION: string;
    VERSION: string;
  };
  CORS: {
    ORIGIN: string;
    CREDENTIALS: boolean;
  };
  LOGGING: {
    BOOTSTRAP_CONTEXT: 'Bootstrap';
  };
}
