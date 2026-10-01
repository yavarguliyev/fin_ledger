export interface DepositLimitView {
  period: string;
  currency: string;
  amountMinor: number;
  pendingAmountMinor: number | null;
  pendingEffectiveAt: string | null;
}

export interface DepositLimitResult {
  message: string;
  limit: DepositLimitView;
}
