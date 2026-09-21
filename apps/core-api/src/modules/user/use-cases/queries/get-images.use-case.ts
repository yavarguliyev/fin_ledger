import { Injectable, NotFoundException } from '@nestjs/common';
import { FileUrlsResponse } from '@common/libs';

import { UserImagesDto } from '../../dtos/input/user-images.dto';
import { UserBaseCase } from '../base/user-base.use-case';

@Injectable()
export class GetImagesUseCase extends UserBaseCase<UserImagesDto, FileUrlsResponse> {
  async execute ({ userId, indexes }: UserImagesDto): Promise<FileUrlsResponse> {
    const user = await this.userRepository.findById({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const key = `user-${userId}`;

    try {
      const response = await this.storageService.get({ key, ...(indexes && { indexes }), expiresIn: 86400 });
      return response as FileUrlsResponse;
    } catch (error) {
      if (error instanceof NotFoundException) return { key, expiresIn: 86400, files: [] };
      throw error;
    }
  }
}
