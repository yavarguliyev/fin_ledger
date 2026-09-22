import { HttpStatus } from '@nestjs/common';

export const PAYMENT_ERRORS = {
  DEPOSIT_OUTCOME_PENDING: {
    code: 'DEPOSIT_OUTCOME_PENDING',
    message: 'Payment outcome is unconfirmed and is awaiting reconciliation',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE
  },
  WITHDRAWAL_OUTCOME_PENDING: {
    code: 'WITHDRAWAL_OUTCOME_PENDING',
    message: 'Withdrawal outcome is unconfirmed and is awaiting reconciliation',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE
  },
  STATUS_UPDATE_FAILED: 'Failed to update payment status'
} as const;
