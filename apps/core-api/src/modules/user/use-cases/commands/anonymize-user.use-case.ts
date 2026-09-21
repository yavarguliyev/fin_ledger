import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRoles } from '@common/libs';

import { UserIdRequestDto } from '../../dtos/request/user-id-request.dto';
import { DeleteUserResponseDto } from '../../dtos/response/delete-user-response.dto';
import { UserBaseCase } from '../base/user-base.use-case';
import { UserHelper } from '../../helpers/user.helper';
import { USER_CONSTANTS } from '../../constants/user.constant';

@Injectable()
export class AnonymizeUserUseCase extends UserBaseCase<UserIdRequestDto, DeleteUserResponseDto> {
  async execute (dto: UserIdRequestDto): Promise<DeleteUserResponseDto> {
    const { userId } = dto;

    const user = await this.userRepository.findById({ id: userId });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    if (user.role !== String(UserRoles.USER)) throw new BadRequestException('Only player accounts can be anonymized');
    if (UserHelper.isAnonymized({ user })) throw new ConflictException('User is already anonymized');

    const { balanceMinor, openPayments, openBets } = await this.userRepository.findAnonymizationBlockers(dto);
    if (balanceMinor !== 0) throw new ConflictException('User still holds funds. Pay out the balance before anonymizing.');
    if (openPayments > 0) throw new ConflictException('User has payments in progress. Wait for them to finish before anonymizing.');
    if (openBets > 0) throw new ConflictException('User has unsettled bets. Settle them before anonymizing.');

    await this.userRepository.anonymize({
      userId,
      email: `deleted-${userId}@${USER_CONSTANTS.ANONYMIZED_EMAIL_DOMAIN}`,
      displayName: USER_CONSTANTS.ANONYMIZED_DISPLAY_NAME
    });

    if (user.profileImagesKey) await this.storageService.delete({ key: user.profileImagesKey });
    await this.sessionService.deleteUserSessions({ userId });

    return { success: true, message: `User ${user.email} has been anonymized` };
  }
}
