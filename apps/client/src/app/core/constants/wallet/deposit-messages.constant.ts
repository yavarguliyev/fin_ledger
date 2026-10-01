export const DEPOSIT_MESSAGES = {
  COMPLETED: 'Deposit completed successfully!',
  OPEN: 'Your deposit is being processed. Your balance will update once it is confirmed.',
  REQUIRES_ACTION: 'Your bank needs to confirm this deposit. Your balance will update once it is confirmed.',
  FAILED: 'Could not start the deposit'
} as const;
