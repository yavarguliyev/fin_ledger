import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { UserRoles } from '@common/shared-libs';

export const ROLES_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';

export const Roles = (...roles: UserRoles[]): ClassDecorator & MethodDecorator => SetMetadata(ROLES_KEY, roles);
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);
