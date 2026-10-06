export enum EmailTemplateType {
  EMAIL_CHANGE_CONFIRM = 'email.user.email-change-confirm',
  EMAIL_CHANGED_NOTICE = 'email.user.email-changed-notice',
  EMAIL_VERIFICATION = 'email.user.verification',
  MFA_DISABLED = 'email.user.mfa-disabled',
  NEW_DEVICE = 'email.user.new-device',
  MFA_ENABLED = 'email.user.mfa-enabled',
  MONITORING_ALERT = 'email.admin.monitoring-alert',
  PASSWORD_CHANGED = 'email.user.password-changed',
  SELF_EXCLUSION_STARTED = 'email.user.self-exclusion-started',
  PASSWORD_RESET = 'email.user.password-reset',
  WELCOME = 'email.user.welcome'
}

export enum MailTransportKind {
  CONSOLE = 'console',
  SMTP = 'smtp',
  SES = 'ses'
}
