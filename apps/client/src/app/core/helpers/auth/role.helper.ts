import { STAFF_ROLES } from '../../constants/auth/staff-roles.constant';
import { UserRole } from '../../types/auth/user-role.type';

export class RoleHelper {
  static isStaffRole (role: UserRole | null | undefined): boolean {
    return !!role && STAFF_ROLES.includes(role);
  }
}
