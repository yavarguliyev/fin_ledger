import { Request } from 'express';

import { UserRoles } from '../enums/common/auth.enum';

export interface AuditRequest extends Request {
  user?: { userId?: string; role?: UserRoles } | undefined;
}
