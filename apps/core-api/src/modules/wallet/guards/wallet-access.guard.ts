import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RequestContext, STAFF_ROLES } from '@common/libs';

import { WalletService } from '../wallet.service';

@Injectable()
export class WalletAccessGuard implements CanActivate {
  constructor (private readonly walletService: WalletService) {}

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestContext>();
    const { userId, role } = request.user;

    if (role && STAFF_ROLES.includes(role)) return true;

    const walletId = request.params['walletId'];
    const wallet = typeof walletId === 'string' ? await this.walletService.getWallet({ walletId }) : null;

    if (wallet?.userId !== userId) throw new ForbiddenException('You do not have access to this wallet');

    return true;
  }
}
