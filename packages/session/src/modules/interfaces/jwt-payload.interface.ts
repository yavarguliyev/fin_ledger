import { UserRoles } from '@common/shared-libs';

import { SessionData } from './session-data.interface';

export interface JwtPayload extends SessionData {
  readonly jti: string;
  readonly sub: string;
  readonly roles: UserRoles[];
}
