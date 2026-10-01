import { Injectable, NotFoundException } from '@nestjs/common';

import { UserIdRequestDto } from '../../dtos/request/user-id-request.dto';
import { CurrentUserResponseDto } from '../../dtos/response/current-user-response.dto';
import { UserHelper } from '../../helpers/user.helper';
import { USER_STATUS_ERRORS } from '../../constants/errors/user-status-errors.constant';
import { UserBaseCase } from '../base/user-base.use-case';

@Injectable()
export class GetCurrentUserUseCase extends UserBaseCase<UserIdRequestDto, CurrentUserResponseDto> {
  constructor () {
    super();
  }

  async execute ({ userId }: UserIdRequestDto): Promise<CurrentUserResponseDto> {
    const user = await this.userRepository.findById({ id: userId });
    if (!user) throw new NotFoundException(USER_STATUS_ERRORS.NOT_FOUND);
    return { user: UserHelper.toCurrentUser({ user }) };
  }
}
