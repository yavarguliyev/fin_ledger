import { UserRole } from '../models/base.model';

const STAFF_ROLES: readonly UserRole[] = ['GLOBAL_ADMIN', 'ADMIN', 'MODERATOR'];

export const isStaffRole = (role: UserRole | null | undefined): boolean => !!role && STAFF_ROLES.includes(role);
