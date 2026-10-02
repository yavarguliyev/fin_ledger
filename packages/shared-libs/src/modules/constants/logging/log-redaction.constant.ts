export const LOG_REDACTION = {
  MASK: '[redacted]',
  ALWAYS: [
    { pattern: /("(?:password|newPassword|currentPassword|secret|accessToken|refreshToken|apiKey|token)"\s*:\s*)"[^"]*"/gi, replacement: '$1"[redacted]"' },
    { pattern: /(Bearer\s+)[A-Za-z0-9\-._~+/]+=*/g, replacement: '$1[redacted]' },
    { pattern: /\b(sk|rk|whsec)_(live|test)_[A-Za-z0-9]+/g, replacement: '$1_$2_[redacted]' },
    { pattern: /\b(?:\d[ -]?){12,18}\d\b/g, replacement: '[redacted]' }
  ],
  LINKS: [{ pattern: /([?&](?:token|code|ticket)=)[^&\s"']+/gi, replacement: '$1[redacted]' }]
} as const;
