export const CALL_RESTART_TEST = {
  CALL_ID: 'call-1',
  OFFER_SDP: 'restart-offer',
  ANSWER_SDP: 'restart-answer',
  GRACE_MS: 15_000,
  MAX_OFFERS: 2,
  EXTRA_DROPS: 3
} as const;
