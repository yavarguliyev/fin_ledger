import { parseExpiry } from './parse-expiry.helper';

export const validateExpiry = (formatted: string): boolean => {
  const parsed = parseExpiry(formatted);
  if (!parsed) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (parsed.year < currentYear) return false;
  if (parsed.year === currentYear && parsed.month < currentMonth) return false;

  return true;
};
