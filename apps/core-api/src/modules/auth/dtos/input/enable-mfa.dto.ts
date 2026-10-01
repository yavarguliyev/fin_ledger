import { z } from 'zod';

import { MfaCodeSchema } from '../request/mfa-code.dto';
import { MfaUserSchema } from './mfa-user.dto';

export const EnableMfaSchema = MfaCodeSchema.extend(MfaUserSchema.shape);

export type EnableMfaDto = z.infer<typeof EnableMfaSchema>;
