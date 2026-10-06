import { Injectable } from '@nestjs/common';

import { AdminBaseUseCase } from '../base/admin-base.use-case';
import { ListAdminUsersRequestDto } from '../../dtos/request/list-admin-users-request.dto';
import { UserWithWalletDto } from '../../../user';

@Injectable()
export class ListAdminUsersUseCase extends AdminBaseUseCase<ListAdminUsersRequestDto, UserWithWalletDto[]> {
  async execute ({ limit, before, beforeId }: ListAdminUsersRequestDto): Promise<UserWithWalletDto[]> {
    return this.userRepository.findPlayerPage({ limit, ...(before && { before }), ...(beforeId && { beforeId }) });
  }
}
