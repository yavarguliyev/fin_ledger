export const BACKGROUND_RUNNER_SPEC = {
  RELAY_START: 'relay:start',
  RELAY_STOP: 'relay:stop',
  CONSUMER_START: 'consumer:start',
  CONSUMER_STOP: 'consumer:stop',
  GATEWAY_START: 'gateway:start',
  WORKER_ONLY: 'WORKER',
  BOTH: 'API, WORKER',
  UNKNOWN: 'API,NOPE',
  EMPTY: ' , '
} as const;
