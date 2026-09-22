import { CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';

import { STAFF_ROLES } from '../constants/auth/staff-roles.constant';
import { ResourceOwnershipDto, ResourceOwnershipSchema } from '../dtos/guard/resource-ownership.dto';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

export abstract class ResourceOwnerGuard implements CanActivate {
  protected abstract readonly resourceName: string;
  protected readonly paramKey: string = 'id';

  protected abstract isOwnedBy(dto: ResourceOwnershipDto): Promise<boolean>;

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { userId, role } = request.user;

    if (role && STAFF_ROLES.includes(role)) return true;

    const ownership = ResourceOwnershipSchema.safeParse({ resourceId: request.params[this.paramKey], userId });
    if (ownership.success && (await this.isOwnedBy(ownership.data))) return true;

    throw new NotFoundException(`${this.resourceName} not found`);
  }
}
