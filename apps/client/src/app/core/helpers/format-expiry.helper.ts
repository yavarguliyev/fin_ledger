export const formatExpiry = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').substring(0, 4);
  if (digits.length === 0) return '';

  if (digits.length === 1) {
    if (parseInt(digits, 10) > 1) return `0${digits}/`;
    return digits;
  }

  return `${digits.substring(0, 2)}/${digits.substring(2)}`;
};
