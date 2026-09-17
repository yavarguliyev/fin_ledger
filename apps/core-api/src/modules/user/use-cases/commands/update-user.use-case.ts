import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionService, UserRoles } from '@common/libs';

import { ConvertWalletCurrencyUseCase } from '../../../wallet-currency-conversion/use-cases/commands/convert-wallet-currency.use-case';
import { UserRepository } from '../../repositories/user.repository';
import { UpdateUser } from '../../dtos/update/update-user.dto';
import { UserUpdateResponeDto } from '../../dtos/update/user-update-response.dto';
import { UserDto } from '../../dtos/user/user.dto';
import { UserBaseCase } from '../base/user-base.use-case';
import { AuthHelper } from '../../../auth/helpers/auth.helper';

@Injectable()
export class UpdateUserUseCase extends UserBaseCase<UpdateUser, UserUpdateResponeDto> {
  constructor (
    private readonly userRepository: UserRepository,
    private readonly convertWalletCurrencyUseCase: ConvertWalletCurrencyUseCase,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService
  ) {
    super();
  }

  async execute ({ userId, dto }: UpdateUser): Promise<UserUpdateResponeDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException(`User with ID ${userId} not found. Please log in again.`);

    if (dto.currency !== undefined && user.role !== (UserRoles.USER as string)) {
      throw new ForbiddenException('Only regular users can update wallet currency');
    }

    const updates: Partial<UserDto> = {};

    if (dto.displayName !== undefined) updates.displayName = dto.displayName;
    if (dto.currency !== undefined) {
      const walletId = user.walletId || undefined;
      const ledgerAccountId = user.ledgerAccountId || undefined;

      await this.convertWalletCurrencyUseCase.execute({ userId, currency: dto.currency, walletId, ledgerAccountId });
    }

    if (dto.imageAction) await this.handleImageAction(dto, user, updates);
    else {
      if (dto.profileImages !== undefined) updates.profileImages = dto.profileImages;
      if (dto.profileImageIndex !== undefined) updates.profileImageIndex = dto.profileImageIndex;
      if (dto.profileImagesKey !== undefined) updates.profileImagesKey = dto.profileImagesKey;
    }

    const userToBeUpdated = Object.keys(updates).length > 0;
    const updatedUser = userToBeUpdated ? await this.userRepository.updateUser(userId, updates) : await this.userRepository.findById(userId);

    if (!updatedUser) throw new NotFoundException('Failed to update user');

    return AuthHelper.createSessionResponse({
      dto: updatedUser,
      sessionService: this.sessionService,
      configService: this.configService
    }) as unknown as UserUpdateResponeDto;
  }
}
