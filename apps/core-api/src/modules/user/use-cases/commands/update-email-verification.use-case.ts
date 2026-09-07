import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KAFKA_SERVICE, KafkaService, PasswordHandler, SessionService, StorageService } from '@common/libs';

import { UserRepository } from '../../repositories/user.repository';
import { UpdateEmailVerificationInput, UserDto } from '../../dtos/user/user.dto';
import { UserBaseCase } from '../base/user-base.use-case';
import { ConvertWalletCurrencyUseCase } from '../../../wallet-currency-conversion/use-cases/commands/convert-wallet-currency.use-case';

@Injectable()
export class UpdateEmailVerificationUseCase extends UserBaseCase<UpdateEmailVerificationInput, UserDto> {
  constructor (
    protected override readonly storageService: StorageService,
    protected override readonly userRepository: UserRepository,
    protected override readonly sessionService: SessionService,
    protected override readonly configService: ConfigService,
    protected override readonly convertWalletCurrencyUseCase: ConvertWalletCurrencyUseCase,
    protected override readonly passwordHelper: PasswordHandler,
    @Inject(KAFKA_SERVICE) kafkaService: KafkaService
  ) {
    super(storageService, userRepository, sessionService, configService, convertWalletCurrencyUseCase, passwordHelper, kafkaService);
  }

  async execute ({ userId, isEmailVerified }: UpdateEmailVerificationInput): Promise<UserDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const updatedUser = await this.userRepository.update(userId, { isEmailVerified });
    if (!updatedUser) throw new NotFoundException('Failed to update email verification status');
    if (!isEmailVerified) await this.sessionService.deleteUserSessions(userId);

    return updatedUser;
  }
}
