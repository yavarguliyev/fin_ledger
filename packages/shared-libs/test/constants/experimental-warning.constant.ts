export const WARNING_SPEC = {
  EXPERIMENTAL: 'ExperimentalWarning',
  DEPRECATION: 'DeprecationWarning',
  SILENCED_METHOD: 'The supports Web Crypto API method is an experimental feature',
  SILENCED_ALGORITHM: 'The ML-DSA-44 Web Crypto API algorithm is an experimental feature',
  KEPT_EXPERIMENTAL: 'VM Modules is an experimental feature',
  KEPT_DEPRECATION: 'Web Crypto API method is going away',
  TIMEOUT_NEGATIVE: 'TimeoutNegativeWarning',
  NEGATIVE_TIMEOUT_MESSAGE: '-5 is a negative number. Timeout duration was set to 1.',
  EMIT_CODE: '(emit, message, type) => emit(message, type)',
  KAFKA_FILENAME: '/app/node_modules/kafkajs/src/network/requestQueue/index.js',
  OWN_FILENAME: '/app/dist/modules/jobs/scheduler.js'
} as const;
