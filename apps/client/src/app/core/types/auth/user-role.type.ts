import { ROLES } from '../../constants/auth/roles.constant';

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
