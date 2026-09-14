export const maskCardNumber = (cardNumber: string): string => {
  const sanitized = cardNumber.replace(/[\s-]/g, '');
  const last4 = sanitized.slice(-4);
  return `**** **** **** ${last4}`;
};
