import { CurrentUserContractSchema } from '@common/contracts';

export const CurrentUserSchema = CurrentUserContractSchema;

export type CurrentUserDto = typeof CurrentUserContractSchema._output;
