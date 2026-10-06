import { UserStatusPathDto } from '../interfaces/user-status.interface';

export const USER_STATUS_TEST = {
  EMAIL: 'player9@realtime-wallet-payments.com',
  ADMIN_EMAIL: 'admin@realtime-wallet-payments.com',
  PLAYER_EMAIL: 'player1@realtime-wallet-payments.com',
  LOGIN_PATH: '/auth/login',
  WALLETS_PATH: '/wallets',
  USERS_PATH: '/admin/users?limit=100',
  STATUS_PATH: ({ id, action }: UserStatusPathDto): string => `/users/${id}/${action}`,
  SUSPEND: 'suspend',
  REACTIVATE: 'reactivate',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CLOSED: 'CLOSED',
  INVALID_CREDENTIALS: 'Invalid credentials',
  CLOSE_SQL: "UPDATE users SET status = 'CLOSED' WHERE id = $1",
  STATUS_SQL: 'SELECT status FROM users WHERE id = $1'
} as const;
