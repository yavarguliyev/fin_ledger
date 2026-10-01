import { DepositLimitContractSchema } from '@common/contracts';

export const DepositLimitViewSchema = DepositLimitContractSchema;

export type DepositLimitViewDto = typeof DepositLimitContractSchema._output;
