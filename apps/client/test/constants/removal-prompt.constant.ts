export const REMOVAL_PROMPT_SPEC = {
  VISA: 'visa',
  LAST_FOUR: '4242',
  CARD_TYPE: 'CREDIT_CARD',
  BANK: 'Revolut',
  BANK_TYPE: 'BANK_ACCOUNT',
  CARD_PROMPT: "Remove Visa •••• 4242? You won't be able to use it for deposits or withdrawals.",
  BANK_PROMPT: "Remove Revolut? You won't be able to use it for deposits or withdrawals."
} as const;
