export const AUDIT_CHAIN_TEST = {
  SERVICE: 'audit-chain-spec',
  ENTITY: 'audit_chain_probe',
  ACTION: 'CHAIN_PROBE',
  EDITED_ACTION: 'CHAIN_PROBE_EDITED',
  ROWS: 3,
  INSERT_SQL: `INSERT INTO audit_log (actor_service, action, entity_type, after_state)
               SELECT $1, $2, $3, jsonb_build_object('n', g) FROM generate_series(1, $4::int) g
               RETURNING chain_seq AS "chainSeq", prev_hash IS NOT NULL AS "hasPrev"`,
  BREAKS_SQL: 'SELECT chain_seq::text AS "chainSeq" FROM audit_log_chain_breaks()',
  DISABLE_SQL: 'ALTER TABLE audit_log DISABLE TRIGGER trg_audit_log_immutable',
  ENABLE_SQL: 'ALTER TABLE audit_log ENABLE TRIGGER trg_audit_log_immutable',
  EDIT_SQL: 'UPDATE audit_log SET action = $1 WHERE chain_seq = $2',
  APPEND_ONLY: 'append-only',
  METRICS_PATH: '/metrics',
  API_SUFFIX: /\/api\/v\d+$/,
  INTACT_BREAKS: '0',
  BREAKS_METRIC: /^core_api_audit_chain_breaks (\d+)$/m
} as const;
