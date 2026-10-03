export interface StaleDepositDto {
  key: string;
  status: string;
  chargeId: string | null;
  amount: number;
  ageHours?: number;
  attempts?: number;
}

export interface ReconcileState {
  status: string;
  credits: number;
  failedEvents: number;
}

export interface ReconcilePaymentDto {
  paymentId: string;
}

export interface ReconcilePollDto {
  done: () => Promise<boolean>;
}

export interface ReconcileIdRow {
  id: string;
}

export interface ReconcileBalanceRow {
  balance: number;
}

export interface ReconcileAttemptsRow {
  attempts: number;
}

export interface ReconcileReviewItem {
  id: string;
  status: string;
}
