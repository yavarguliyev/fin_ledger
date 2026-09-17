import { CardBrand, DigitalWalletType, ProviderChargeStatus } from '@common/shared-libs';

import { ProviderMethodResultDto } from './provider-method-result.dto';

export type OperationDto = { id: string; status: ProviderChargeStatus };

export type CreateFailedOperationDto = { prefix: string; amount: number; currency: string; error: unknown };

export type CreateFailedMethodDto = { token: string | undefined; error: unknown; walletType: DigitalWalletType | undefined };

export type ExecuteMethodOperationDto = {
  token: string | undefined;
  walletType: DigitalWalletType | undefined;
  operation: () => Promise<ProviderMethodResultDto>;
};

export type MapVerifiedMethodDto = {
  token: string;
  brand: CardBrand;
  last4?: string | undefined;
  walletType?: DigitalWalletType | undefined;
  rawResponse?: Record<string, unknown> | undefined;
};

export type ExecuteOperationDto = {
  prefix: string;
  amount: number;
  currency: string;
  operation: () => Promise<string | { id: string; status?: ProviderChargeStatus }>;
};
