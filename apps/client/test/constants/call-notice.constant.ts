export const CALL_NOTICE_TEST = {
  DECLINED: 'DECLINED',
  BUSY: 'BUSY',
  MISSED: 'MISSED',
  HANGUP: 'HANGUP',
  DECLINED_NOTICE: 'Call declined',
  BUSY_NOTICE: 'On another call',
  MISSED_NOTICE: 'Missed call',
  ENDED_NOTICE: 'Call ended',
  MIC_DENIED: 'Allow microphone and camera access to make calls',
  FAILED_NOTICE: 'Call failed',
  PERMISSION_ERROR: 'NotAllowedError',
  ELAPSED_MS: 125_000,
  ELAPSED_LABEL: '02:05'
} as const;
