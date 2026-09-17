import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService, FileUrlsResponse } from '@common/libs';

import { UserRepository } from '../../repositories/user.repository';
import { UserBaseCase } from '../base/user-base.use-case';
import { UserImagesDto } from '../../dtos/update/user-images.dto';

@Injectable()
export class GetImagesUseCase extends UserBaseCase<UserImagesDto, FileUrlsResponse> {
  constructor (
    private readonly userRepository: UserRepository,
    private readonly storage: StorageService
  ) {
    super();
  }

  async execute ({ userId, indexes }: UserImagesDto): Promise<FileUrlsResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const key = `user-${userId}`;

    try {
      const response = await this.storage.get(key, indexes, 86400);
      return response as FileUrlsResponse;
    } catch (error) {
      if (error instanceof NotFoundException) return { key, expiresIn: 86400, files: [] };
      throw error;
    }
  }
}
