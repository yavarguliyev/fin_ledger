import { ROLES } from '../../constants/auth/roles.constant';
import { ROLE_SETS } from '../../constants/auth/role-sets.constant';
import { SESSION } from '../../constants/auth/session.constant';
import { RoleNameRefDto } from '../../interfaces/auth/role-name-ref.interface';
import { RoleRefDto } from '../../interfaces/auth/role-ref.interface';

export class RoleHelper {
  static isStaff ({ role }: RoleRefDto): boolean {
    return !!role && ROLE_SETS.STAFF.includes(role);
  }

  static isAdmin ({ role }: RoleRefDto): boolean {
    return !!role && ROLE_SETS.ADMIN.includes(role);
  }

  static isStaffName ({ role }: RoleNameRefDto): boolean {
    return (ROLE_SETS.STAFF as readonly string[]).includes(role);
  }

  static isPlayer ({ role }: RoleRefDto): boolean {
    return role === ROLES.USER;
  }

  static landingRoute ({ role }: RoleRefDto): string {
    return RoleHelper.isPlayer({ role }) ? SESSION.PLAYER_ROUTE : SESSION.STAFF_ROUTE;
  }

  static label ({ role }: RoleRefDto): string {
    const resolved = role ?? ROLES.USER;
    return resolved.charAt(0).toUpperCase() + resolved.slice(1);
  }
}
