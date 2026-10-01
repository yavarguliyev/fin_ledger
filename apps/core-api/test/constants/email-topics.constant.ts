export const EMAIL_TOPICS = {
  EMAIL_VERIFICATION: 'email.user.verification',
  PASSWORD_RESET: 'email.user.password-reset',
  PASSWORD_CHANGED: 'email.user.password-changed',
  EMAIL_CHANGE_CONFIRM: 'email.user.email-change-confirm',
  EMAIL_CHANGED_NOTICE: 'email.user.email-changed-notice',
  MFA_ENABLED: 'email.user.mfa-enabled',
  MFA_DISABLED: 'email.user.mfa-disabled',
  SELF_EXCLUSION_STARTED: 'email.user.self-exclusion-started',
  NEW_DEVICE: 'email.user.new-device'
} as const;
