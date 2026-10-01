import type { CurrentUserContract, SessionUserContract } from '@common/contracts';

import { UserRole } from './user-role.type';

type CurrentUserExtras = Pick<CurrentUserContract, 'lastLoginIp' | 'isEmailVerified' | 'updatedAt'>;

export type AuthUser = Omit<SessionUserContract, 'role'> & Partial<CurrentUserExtras> & { role: UserRole };
