export const AUDIT_CHAIN = {
  BREAKS: 'audit_chain_breaks',
  CHECK_EVERY_MS: 300_000,
  SQL: 'SELECT count(*)::int AS breaks FROM audit_log_chain_breaks()'
} as const;
