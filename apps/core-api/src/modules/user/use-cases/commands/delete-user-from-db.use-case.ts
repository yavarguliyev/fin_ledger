import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { UserIdRequestDto } from '../../dtos/request/user-id-request.dto';
import { DeleteUserResponseDto } from '../../dtos/response/delete-user-response.dto';
import { UserBaseCase } from '../base/user-base.use-case';

@Injectable()
export class DeleteUserFromDbUseCase extends UserBaseCase<UserIdRequestDto, DeleteUserResponseDto> {
  async execute (dto: UserIdRequestDto): Promise<DeleteUserResponseDto> {
    const { userId } = dto;

    const user = await this.userRepository.findById({ id: userId });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    if (await this.userRepository.hasRetainedRecords(dto)) {
      throw new ConflictException('User has financial or audit history and cannot be permanently removed. Use soft delete instead.');
    }

    await this.userRepository.delete({ id: userId });

    if (user.deletedAt === null) {
      if (user.profileImagesKey) await this.storageService.delete({ key: user.profileImagesKey });
      await this.sessionService.deleteUserSessions({ userId });
    }

    return { success: true, message: `User ${user.email} has been removed successfully` };
  }
}
