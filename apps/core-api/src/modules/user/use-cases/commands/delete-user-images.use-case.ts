import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '@common/libs';

import { UserRepository } from '../../repositories/user.repository';
import { UserBaseCase } from '../base/user-base.use-case';
import { UserImagesDto } from '../../dtos/update/user-images.dto';

@Injectable()
export class DeleteImagesUseCase extends UserBaseCase<UserImagesDto, void> {
  constructor (
    private readonly userRepository: UserRepository,
    private readonly storage: StorageService
  ) {
    super();
  }

  async execute ({ userId, indexes }: UserImagesDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    await this.storage.delete(`user-${userId}`, indexes);
  }
}
