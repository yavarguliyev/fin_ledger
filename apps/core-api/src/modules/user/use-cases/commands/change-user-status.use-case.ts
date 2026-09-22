import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserStatus } from '@common/libs';

import { UserBaseCase } from '../base/user-base.use-case';
import { UserDto } from '../../dtos/user/user.dto';
import { ChangeUserStatusDto } from '../../dtos/input/change-user-status.dto';
import { USER_STATUS_TRANSITIONS } from '../../constants/status/user-status-transitions.constant';
import { USER_STATUS_ERRORS } from '../../constants/errors/user-status-errors.constant';

@Injectable()
export class ChangeUserStatusUseCase extends UserBaseCase<ChangeUserStatusDto, UserDto> {
  async execute ({ userId, actorId, status }: ChangeUserStatusDto): Promise<UserDto> {
    if (userId === actorId) throw new BadRequestException(USER_STATUS_ERRORS.OWN_ACCOUNT);

    const user = await this.userRepository.findById({ id: userId });
    if (!user) throw new NotFoundException(USER_STATUS_ERRORS.NOT_FOUND);

    const allowedFrom = Object.entries(USER_STATUS_TRANSITIONS).filter(([, targets]) => targets.includes(status)).map(([from]) => from);
    const updated = await this.userRepository.updateWhere({ where: { id: userId, status: allowedFrom }, data: { status } });
    if (!updated) throw new ConflictException(USER_STATUS_ERRORS.NOT_ALLOWED);

    if (status !== UserStatus.ACTIVE) await this.sessionService.deleteUserSessions({ userId });

    return updated;
  }
}
