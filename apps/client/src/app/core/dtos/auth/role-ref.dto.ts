import { UserRole } from '../../types/auth/user-role.type';

export interface RoleRefDto {
  role: UserRole | null | undefined;
}
