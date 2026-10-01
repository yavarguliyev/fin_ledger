import { WalletContractSchema } from '@common/contracts';

export const WalletSchema = WalletContractSchema;

export type WalletDto = typeof WalletContractSchema._output;
