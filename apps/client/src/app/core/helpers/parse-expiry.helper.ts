export const parseExpiry = (formatted: string): { month: number; year: number } | null => {
  const digits = formatted.replace(/\D/g, '');
  if (digits.length < 4) return null;

  const month = parseInt(digits.substring(0, 2), 10);
  const year = 2000 + parseInt(digits.substring(2, 4), 10);
  if (month < 1 || month > 12) return null;

  return { month, year };
};
