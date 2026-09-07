import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KAFKA_SERVICE, KafkaService, StorageService, SessionService, PasswordHandler } from '@common/libs';

import { UserRepository } from '../../repositories/user.repository';
import { DeleteUserDto } from '../../dtos/user/user.dto';
import { UserBaseCase } from '../base/user-base.use-case';
import { ConvertWalletCurrencyUseCase } from '../../../wallet-currency-conversion/use-cases/commands/convert-wallet-currency.use-case';

@Injectable()
export class DeleteUserFromDbUseCase extends UserBaseCase<string, DeleteUserDto> {
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

  async execute (userId: string): Promise<DeleteUserDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const isDeleted = user.deletedAt !== null;
    if (!isDeleted && user.profileImagesKey) await this.storageService.delete(user.profileImagesKey);

    await this.userRepository.delete(userId);
    if (!isDeleted) await this.sessionService.deleteUserSessions(userId);

    return { success: true, message: `User ${user.email} has been removed successfully` };
  }
}
