import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { UpdateUserDto } from '../../dtos/input/update-user.dto';
import { CurrentUserResponseDto } from '../../dtos/response/current-user-response.dto';
import { UserDto } from '../../dtos/user/user.dto';
import { UserBaseCase } from '../base/user-base.use-case';
import { UserHelper } from '../../helpers/user.helper';
import { ApplyIdentityFieldsDto } from '../../dtos/profile/apply-identity-fields.dto';
import { PROFILE_FIELDS } from '../../constants/profile/profile-fields.constant';

@Injectable()
export class UpdateUserUseCase extends UserBaseCase<UpdateUserDto, CurrentUserResponseDto> {
  async execute (dto: UpdateUserDto): Promise<CurrentUserResponseDto> {
    const { userId } = dto;

    const user = await this.userRepository.findById({ id: userId });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found. Please log in again.`);

    const updates: Partial<UserDto> = {};

    if (dto.displayName !== undefined) updates.displayName = dto.displayName;

    this.applyIdentityFields({ dto, user, updates });

    if (dto.imageAction) await this.handleImageAction({ request: dto, user, updates });
    else {
      if (dto.profileImages !== undefined) updates.profileImages = dto.profileImages;
      if (dto.profileImageIndex !== undefined) updates.profileImageIndex = dto.profileImageIndex;
    }

    const userToBeUpdated = Object.keys(updates).length > 0;
    const updatedUser = userToBeUpdated
      ? await this.userRepository.updateUser({ userId, updates })
      : await this.userRepository.findById({ id: userId });

    if (!updatedUser) throw new NotFoundException('Failed to update user');

    return { user: UserHelper.toCurrentUser({ user: updatedUser }) };
  }

  private applyIdentityFields ({ dto, user, updates }: ApplyIdentityFieldsDto): void {
    const changingCountry = dto.countryCode !== undefined && dto.countryCode !== user.countryCode;
    const changingBirthDate = dto.dateOfBirth !== undefined && dto.dateOfBirth !== user.dateOfBirth;
    if (!changingCountry && !changingBirthDate) return;

    if (user.kycStatus === PROFILE_FIELDS.KYC_APPROVED) throw new ConflictException(PROFILE_FIELDS.LOCKED_MESSAGE);

    if (changingCountry) updates.countryCode = dto.countryCode;
    if (changingBirthDate) updates.dateOfBirth = dto.dateOfBirth;
  }
}
