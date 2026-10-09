export const SMS_CONSTANTS = {
  TWILIO_API_BASE: 'https://api.twilio.com/2010-04-01/Accounts',
  DEFAULT_SENDER: 'SYSTEM',
  CONSOLE_PREFIX: 'SMS not delivered (console transport).',
  BODY_PREFIX: '  ↳ message:',
  SNS_DEFAULT_REGION: 'us-east-1',
  SNS_SENDER_ID_ATTRIBUTE: 'AWS.SNS.SMS.SenderID',
  SNS_SMS_TYPE_ATTRIBUTE: 'AWS.SNS.SMS.SMSType',
  SNS_SMS_TYPE: 'Transactional',
  SNS_STRING_TYPE: 'String'
} as const;
