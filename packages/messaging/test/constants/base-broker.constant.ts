export const BASE_BROKER_TEST = {
  QUEUE: 'notifications.wallet.credited',
  OTHER_QUEUE: 'notifications.wallet.debited',
  ROUTING_KEY: 'wallet.credited',
  EVENT_ID: '6b1d3c1e-2f9a-4c5e-9d70-0d3f5b8a1c22',
  FAILURE: 'handler failed',
  RELEASE_FAILURE: 'permission denied for table inbox_messages',
  PAYLOAD: { walletId: 'wallet-1' }
} as const;
