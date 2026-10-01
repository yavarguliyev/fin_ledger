import { Injectable, NotFoundException } from '@nestjs/common';
import { UserStatus } from '@common/libs';

import { UserDto } from '../../dtos/user/user.dto';
import { UpdateEmailVerificationDto } from '../../dtos/request/update-email-verification.dto';
import { UserBaseCase } from '../base/user-base.use-case';

@Injectable()
export class UpdateEmailVerificationUseCase extends UserBaseCase<UpdateEmailVerificationDto, UserDto> {
  async execute ({ userId, isEmailVerified }: UpdateEmailVerificationDto): Promise<UserDto> {
    const user = await this.userRepository.findById({ id: userId });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const updatedUser = await this.userRepository.update({
      id: userId,
      data: {
        isEmailVerified,
        emailVerifiedAt: isEmailVerified ? new Date().toISOString() : null,
        ...(isEmailVerified && user.status === UserStatus.PENDING && { status: UserStatus.ACTIVE })
      }
    });

    if (!updatedUser) throw new NotFoundException('Failed to update email verification status');
    if (!isEmailVerified) await this.sessionService.deleteUserSessions({ userId });

    return updatedUser;
  }
}
