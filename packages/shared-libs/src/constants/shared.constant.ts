import { UnknownRecord } from '../types/base.type';

export const APP_CONSTANTS = { DEFAULT_CURRENCY: 'USD' } as const;

export const EXTRACT_ID_KEY = (result: unknown, id: 'walletId' | 'paymentId' | 'userId'): string => (result as UnknownRecord)[id] as string;

export const JWT_ERROR_NAMES = ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'] as string[];

export const BETTING_TYPES = ['BET', 'WINNING', 'NONE'] as const;

export const STORAGE_STRATEGIES = ['s3', 'local'] as const;

export const ACTION_EVENTS = ['completed', 'failed', 'credited', 'debited'] as const;

export const AGGREGATE_TYPES = ['User', 'Wallet', 'Payment', 'None'] as const;

export const TOKEN_TYPES = ['Bearer'] as const;

export const FLOW_DIRECTIONS = ['source', 'target'] as const;

export const WALLET_STATUS = ['ACTIVE', 'SUSPENDED', 'CLOSED'] as const;

export const OPERATORS = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'ILIKE', 'IN', 'NOT IN'] as const;

export const JOIN_CLAUSE_TYPES = ['INNER', 'LEFT', 'RIGHT', 'FULL'] as const;

export const ORDER_DIRECTIONS = ['ASC', 'DESC'] as const;

export const RABBITMQ_KEYS = ['wallet.events', 'wallet.events.dlx', 'wallet.analytics', 5000, 50] as const;

export const WORKFLOW_NAMES = ['PaymentDepositOrchestratorWorkflow'];

export const WORKFLOW_STEPS = ['CreatePaymentRecord', 'CreditWallet', 'EmitPaymentEvent', 'ReserveFunds', 'ValidatePaymentMethod'];

export const MODULES_KEYS = [
  'Admin',
  'Auth',
  'Game Events',
  'Ledgers',
  'Notifications',
  'Payments',
  'Payment Methods',
  'Uploads',
  'Users',
  'Wallets',
  'Wallet Transactions',
  'Metrics'
] as const;

export const CACHE_KEYS = [
  'admin-dashboard',
  'game-events',
  'notification',
  'notification:list',
  'ledger',
  'ledger:system',
  'ledger:account',
  'ledger:transaction',
  'ledger:entries',
  'payment',
  'payment-method:list',
  'payment-method',
  'storage:file-urls',
  'wallet',
  'wallet:user',
  'wallet:transaction',
  'wallet:transaction:bets',
  'wallet:transaction:summary'
] as const;

export const CACHE_TTLS = [0, 30, 60, 120, 180, 300, 600, 82800] as const;

export const WIN_CHANCE = 0.45 as const;

export const WIN_PAYOUT_MULTIPLIER = 2.0 as const;
