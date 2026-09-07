import { BadRequestException } from '@nestjs/common';

export const normalizeCurrency = (currency: string): string => {
  const normalized = currency.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new BadRequestException('Currency must be a 3-letter ISO code');
  }

  return normalized;
};
