export interface SettledBet {
  id: string;
  status: string;
  payoutMinor: number;
  potentialPayoutMinor: number;
}

export interface BettingSeat {
  token: string;
  walletId: string;
  currency: string;
  eventId: string;
}

export interface PlaceBet {
  seat: BettingSeat;
  idempotencyKey: string;
}

export interface WalletRow {
  id: string;
  currency: string;
}

export interface EventRow {
  id: string;
}

export interface ContentRow {
  content: string;
}

export interface DrawAuditRow {
  status: string;
  draw_value: string;
  draw_threshold: string;
  odds_at_placement: string;
}
