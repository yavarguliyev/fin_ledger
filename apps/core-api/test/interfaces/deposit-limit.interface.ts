export interface DepositLimitView {
  period: string;
  currency: string;
  amountMinor: number;
  pendingAmountMinor: number | null;
  pendingEffectiveAt: string | null;
}

export interface LimitAmountDto {
  amountMinor: number;
}

export interface LimitDepositDto {
  amountMinor: number;
  key: string;
}

export interface LimitAmountRow {
  amount: string;
}

export interface LimitVerified {
  accessToken: string;
}

export interface DepositLimitResult {
  message: string;
  limit: DepositLimitView;
}
