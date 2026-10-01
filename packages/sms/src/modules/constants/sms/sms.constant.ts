export const SMS_CONSTANTS = {
  TWILIO_API_BASE: 'https://api.twilio.com/2010-04-01/Accounts',
  DEFAULT_SENDER: 'SYSTEM',
  CONSOLE_PREFIX: 'SMS not delivered (console transport).',
  BODY_PREFIX: '  ↳ message:'
} as const;
