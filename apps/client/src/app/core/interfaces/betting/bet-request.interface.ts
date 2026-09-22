export interface BetRequest {
  walletId: string;
  eventId: string;
  selection: string;
  stakeMinor: number;
  idempotencyKey: string;
}
