import { Injectable, NotFoundException } from '@nestjs/common';

import { UpdateUserDto } from '../../dtos/input/update-user.dto';
import { UserUpdateRecordDto } from '../../dtos/response/user-update-response.dto';
import { UserDto } from '../../dtos/user/user.dto';
import { UserBaseCase } from '../base/user-base.use-case';
import { AuthHelper } from '../../../auth/helpers/auth.helper';

@Injectable()
export class UpdateUserUseCase extends UserBaseCase<UpdateUserDto, UserUpdateRecordDto> {
  async execute (dto: UpdateUserDto): Promise<UserUpdateRecordDto> {
    const { userId } = dto;

    const user = await this.userRepository.findById({ id: userId });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found. Please log in again.`);

    const updates: Partial<UserDto> = {};

    if (dto.displayName !== undefined) updates.displayName = dto.displayName;

    if (dto.imageAction) await this.handleImageAction({ request: dto, user, updates });
    else {
      if (dto.profileImages !== undefined) updates.profileImages = dto.profileImages;
      if (dto.profileImageIndex !== undefined) updates.profileImageIndex = dto.profileImageIndex;
      if (dto.profileImagesKey !== undefined) updates.profileImagesKey = dto.profileImagesKey;
    }

    const userToBeUpdated = Object.keys(updates).length > 0;
    const updatedUser = userToBeUpdated ? await this.userRepository.updateUser({ userId, updates }) : await this.userRepository.findById({ id: userId });

    if (!updatedUser) throw new NotFoundException('Failed to update user');

    return AuthHelper.createSessionResponse({
      dto: updatedUser,
      sessionService: this.sessionService,
      configService: this.configService
    }) as unknown as UserUpdateRecordDto;
  }
}
