export interface RateLimitHitRecord {
  readonly totalHits: number;
  readonly timeToExpireMs: number;
  readonly timeToBlockExpireMs: number;
}
