import { ModuleRegistry } from '@common/shared-libs';

export const SHARED_CONSTANTS = {
  ADMIN: { key: 'Admin' },
  AUDIT_LOG: { key: 'Audit Logs' },
  AUTH: { key: 'Auth' },
  BET: { key: 'Bets' },
  GAME_EVENTS: { key: 'Game Events' },
  LEDGER: { key: 'Ledgers' },
  NOTIFICATION: { key: 'Notifications' },
  PAYMENT: { key: 'Payments' },
  PAYMENT_METHOD: { key: 'Payment Methods' },
  UPLOAD: { key: 'Uploads' },
  USER: { key: 'Users' },
  WALLET: { key: 'Wallets' },
  WALLET_TRANSACTION: { key: 'Wallet Transactions' },
  METRICS: { key: 'Metrics' },
  WEBHOOK: { key: 'Webhooks' }
} satisfies ModuleRegistry;
