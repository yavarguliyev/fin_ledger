import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { UserIdRequestDto } from '../../dtos/request/user-id-request.dto';
import { DeleteUserResponseDto } from '../../dtos/response/delete-user-response.dto';
import { UserBaseCase } from '../base/user-base.use-case';
import { UserHelper } from '../../helpers/user.helper';

@Injectable()
export class DeleteUserUseCase extends UserBaseCase<UserIdRequestDto, DeleteUserResponseDto> {
  async execute ({ userId }: UserIdRequestDto): Promise<DeleteUserResponseDto> {
    const user = await this.userRepository.findById({ id: userId });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    if (UserHelper.isAnonymized({ user })) throw new ConflictException('Anonymized users cannot be restored');

    const isDeleted = user.deletedAt !== null;
    const newDeletedAt = isDeleted ? null : new Date().toISOString();

    if (!isDeleted && user.profileImagesKey) await this.storageService.delete({ key: user.profileImagesKey });
    await this.userRepository.softDelete({ id: userId, data: { deletedAt: newDeletedAt } });
    if (!isDeleted) await this.sessionService.deleteUserSessions({ userId });

    const message = isDeleted ? `User ${user.email} has been restored successfully` : `User ${user.email} has been deleted successfully`;

    return { success: true, message };
  }
}
