import { Injectable, NotFoundException } from '@nestjs/common';

import { UserImagesDto } from '../../dtos/input/user-images.dto';
import { UserBaseCase } from '../base/user-base.use-case';

@Injectable()
export class DeleteImagesUseCase extends UserBaseCase<UserImagesDto, void> {
  async execute ({ userId, indexes }: UserImagesDto): Promise<void> {
    const user = await this.userRepository.findById({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    await this.storageService.delete({ key: `user-${userId}`, ...(indexes && { indexes }) });
  }
}
