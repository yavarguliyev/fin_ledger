export const PASSKEY_SPEC = {
  IPHONE_AGENT: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
  WINDOWS_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  UNKNOWN_AGENT: 'Mozilla/5.0 (Unknown)',
  IPHONE_LABEL: 'iPhone',
  WINDOWS_LABEL: 'Windows PC',
  DEFAULT_LABEL: 'This device',
  OWNER_LENGTH: 32,
  CANCELLED: 'NotAllowedError',
  ABORTED: 'AbortError',
  OTHER: 'SecurityError'
} as const;
