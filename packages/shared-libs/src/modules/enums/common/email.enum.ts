export enum EmailTemplateType {
  EMAIL_VERIFICATION = 'email.user.verification',
  PASSWORD_RESET = 'email.user.password-reset',
  WELCOME = 'email.user.welcome'
}

export enum MailTransportKind {
  CONSOLE = 'console',
  SMTP = 'smtp'
}
