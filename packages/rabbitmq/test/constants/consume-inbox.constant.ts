export const CONSUME_INBOX_TEST = {
  QUEUE: 'notifications.wallet.credited',
  EVENT_ID: '6b1d3c1e-2f9a-4c5e-9d70-0d3f5b8a1c22',
  FAILURE: 'handler failed',
  PAYLOAD: { walletId: 'wallet-1' }
} as const;
