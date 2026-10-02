export const LOG_REDACTION_SPEC = {
  PASSWORD_JSON: '{"email":"a@b.com","password":"Hunter2!"}',
  PASSWORD_REDACTED: '{"email":"a@b.com","password":"[redacted]"}',
  BEARER: 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.e30.sig',
  BEARER_REDACTED: 'Authorization: Bearer [redacted]',
  STRIPE_KEY: 'using sk_test_51AbCdEf for payments',
  STRIPE_REDACTED: 'using sk_test_[redacted] for payments',
  CARD: 'card 4242 4242 4242 4242 declined',
  CARD_REDACTED: 'card [redacted] declined',
  LINK: 'Link: http://localhost:4200/auth/reset-password?token=abc.def&x=1',
  LINK_REDACTED: 'Link: http://localhost:4200/auth/reset-password?token=[redacted]&x=1',
  UUID: 'payment 0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b completed',
  AMOUNT: 'deposit of 100000 minor units'
} as const;
