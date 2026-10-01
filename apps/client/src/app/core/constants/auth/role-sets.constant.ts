import { ROLES } from './roles.constant';
import { UserRole } from '../../types/auth/user-role.type';

export const ROLE_SETS: Record<'STAFF' | 'ADMIN' | 'PLAYER', readonly UserRole[]> = {
  STAFF: [ROLES.GLOBAL_ADMIN, ROLES.ADMIN, ROLES.MODERATOR],
  ADMIN: [ROLES.GLOBAL_ADMIN, ROLES.ADMIN],
  PLAYER: [ROLES.USER]
};
