import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService, SessionService } from '@common/libs';

import { UserRepository } from '../../repositories/user.repository';
import { DeleteUserDto } from '../../dtos/user/user.dto';
import { UserBaseCase } from '../base/user-base.use-case';

@Injectable()
export class DeleteUserFromDbUseCase extends UserBaseCase<string, DeleteUserDto> {
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
    if (!isDeleted && user.profileImagesKey) await this.storage.delete(user.profileImagesKey);

    await this.userRepository.delete(userId);
    if (!isDeleted) await this.sessionService.deleteUserSessions(userId);

    return { success: true, message: `User ${user.email} has been removed successfully` };
  }
}
