export const RESPONSE_CACHE_TEST = {
  URL: 'http://localhost:3000/api/v1/wallets',
  GET: 'GET',
  POST: 'POST',
  BODY: { ok: true },
  NOW: 1_000_000,
  WITHIN_TTL_MS: 1000,
  PAST_TTL_MS: 4000,
  ONE_CALL: 1,
  TWO_CALLS: 2
} as const;
