import { BadRequestException } from '@nestjs/common';

export const convertMinorAmount = (sourceAmountMinor: number | string, rate: string): number => {
  const numericAmount = Number(sourceAmountMinor);
  if (!Number.isSafeInteger(numericAmount)) {
    throw new BadRequestException('Source amount must be a safe integer');
  }

  const isNegative = numericAmount < 0;
  const absAmount = Math.abs(numericAmount);

  const match = rate.match(/^(\d+)(?:\.(\d+))?$/);
  const whole = match?.[1];
  const fractional = match?.[2] ?? '';

  if (!whole) throw new BadRequestException('FX rate is invalid');

  const scale = 10n ** BigInt(fractional.length);
  const scaledRate = BigInt(`${whole}${fractional}`);

  if (scaledRate <= 0n) throw new BadRequestException('FX rate must be greater than zero');

  const result = (BigInt(absAmount) * scaledRate + scale / 2n) / scale;
  if (result > BigInt(Number.MAX_SAFE_INTEGER)) throw new BadRequestException('Converted amount exceeds the supported range');

  const finalAmount = Number(result);
  return isNegative ? -finalAmount : finalAmount;
};
