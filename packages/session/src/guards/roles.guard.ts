import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoles } from '@common/shared-libs';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestContext } from '../interfaces/session.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor (private reflector: Reflector) {}

  canActivate (context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestContext>();
    const userRole = request.user?.role;

    if (!userRole) {
      throw new ForbiddenException('Insufficient permissions to perform this action');
    }

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(`Insufficient permissions to perform this action. Required roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
