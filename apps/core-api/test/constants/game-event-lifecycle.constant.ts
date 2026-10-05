import { HTTP_STATUS } from './http-status.constant';

export const GAME_EVENT_LIFECYCLE = {
  ...HTTP_STATUS,
  PLAYER_EMAIL: 'player18@realtime-wallet-payments.com',
  ADMIN_EMAIL: 'admin@realtime-wallet-payments.com',
  STAKE_MINOR: 500,
  HOUR_MS: 60 * 60 * 1000,
  GAME_EVENTS_PATH: '/game-events',
  STATUS_PATH: (eventId: string): string => `/game-events/${eventId}/status`,
  RESULT_PATH: (eventId: string): string => `/game-events/${eventId}/result`,
  BETS_PATH: '/bets',
  SPORT: 'Football',
  LABEL: 'Lifecycle probe',
  ODDS: 2.5,
  HOME: 'HOME',
  KEY_PREFIX: 'lifecycle-',
  SCHEDULED: 'SCHEDULED',
  LIVE: 'LIVE',
  FINISHED: 'FINISHED',
  SETTLED: 'SETTLED',
  CANCELLED: 'CANCELLED',
  WALLET_SQL: 'SELECT w.id FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.email = $1'
} as const;
