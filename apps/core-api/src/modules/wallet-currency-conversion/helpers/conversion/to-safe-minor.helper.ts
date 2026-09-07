import { ConflictException } from '@nestjs/common';

export const toSafeMinor = (value: number | undefined, label: string): number => {
  const amount = Number(value);

  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new ConflictException(`${label} is invalid`);
  }

  return amount;
};
