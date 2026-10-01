import { z } from 'zod';

import { DisableMfaRequestSchema } from '../request/disable-mfa-request.dto';
import { MfaUserSchema } from './mfa-user.dto';

export const DisableMfaSchema = DisableMfaRequestSchema.extend(MfaUserSchema.shape);

export type DisableMfaDto = z.infer<typeof DisableMfaSchema>;
