import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KAFKA_SERVICE, KafkaService, StorageService, SessionService, PasswordHandler } from '@common/libs';

import { UserRepository } from '../../repositories/user.repository';
import { DeleteUserDto } from '../../dtos/user/user.dto';
import { UserBaseCase } from '../base/user-base.use-case';
import { ConvertWalletCurrencyUseCase } from '../../../wallet-currency-conversion/use-cases/commands/convert-wallet-currency.use-case';

@Injectable()
export class DeleteUserUseCase extends UserBaseCase<string, DeleteUserDto> {
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
    const newDeletedAt = isDeleted ? null : new Date().toISOString();

    if (!isDeleted && user.profileImagesKey) await this.storageService.delete(user.profileImagesKey);
    await this.userRepository.softDelete(userId, { deletedAt: newDeletedAt });
    if (!isDeleted) await this.sessionService.deleteUserSessions(userId);

    const message = isDeleted ? `User ${user.email} has been restored successfully` : `User ${user.email} has been deleted successfully`;

    return { success: true, message };
  }
}
