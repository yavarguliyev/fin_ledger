import { UserRole } from '../../types/auth/user-role.type';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles?: readonly UserRole[];
}
