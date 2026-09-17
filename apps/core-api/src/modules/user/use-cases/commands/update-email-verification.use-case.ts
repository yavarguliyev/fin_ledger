import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionService } from '@common/libs';

import { UserRepository } from '../../repositories/user.repository';
import { UpdateEmailVerificationInput, UserDto } from '../../dtos/user/user.dto';
import { UserBaseCase } from '../base/user-base.use-case';

@Injectable()
export class UpdateEmailVerificationUseCase extends UserBaseCase<UpdateEmailVerificationInput, UserDto> {
  constructor (
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService
  ) {
    super();
  }

  async execute ({ userId, isEmailVerified }: UpdateEmailVerificationInput): Promise<UserDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const updatedUser = await this.userRepository.update(userId, { isEmailVerified });
    if (!updatedUser) throw new NotFoundException('Failed to update email verification status');
    if (!isEmailVerified) await this.sessionService.deleteUserSessions(userId);

    return updatedUser;
  }
}
