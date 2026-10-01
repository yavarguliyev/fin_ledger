import { BetContractSchema } from '@common/contracts';

export const BetSchema = BetContractSchema;

export type BetDto = typeof BetContractSchema._output;
