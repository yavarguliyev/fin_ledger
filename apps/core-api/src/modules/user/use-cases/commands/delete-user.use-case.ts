import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService, SessionService } from '@common/libs';

import { UserRepository } from '../../repositories/user.repository';
import { DeleteUserDto } from '../../dtos/user/user.dto';
import { UserBaseCase } from '../base/user-base.use-case';

@Injectable()
export class DeleteUserUseCase extends UserBaseCase<string, DeleteUserDto> {
  constructor (
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService,
    private readonly storage: StorageService
  ) {
    super();
  }

  async execute (userId: string): Promise<DeleteUserDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const isDeleted = user.deletedAt !== null;
    const newDeletedAt = isDeleted ? null : new Date().toISOString();

    if (!isDeleted && user.profileImagesKey) await this.storage.delete(user.profileImagesKey);
    await this.userRepository.softDelete(userId, { deletedAt: newDeletedAt });
    if (!isDeleted) await this.sessionService.deleteUserSessions(userId);

    const message = isDeleted ? `User ${user.email} has been restored successfully` : `User ${user.email} has been deleted successfully`;

    return { success: true, message };
  }
}
