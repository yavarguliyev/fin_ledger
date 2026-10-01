import { WalletTransactionContractSchema } from '@common/contracts';

export const WalletTransactionRecordSchema = WalletTransactionContractSchema;

export type WalletTransactionRecordDto = typeof WalletTransactionContractSchema._output;
