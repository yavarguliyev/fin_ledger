import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KAFKA_SERVICE, KafkaService, PasswordHandler, SessionService, StorageService } from '@common/libs';

import { UserRepository } from '../../repositories/user.repository';
import { UserBaseCase } from '../base/user-base.use-case';
import { UserImagesDto } from '../../dtos/update/user-images.dto';
import { ConvertWalletCurrencyUseCase } from '../../../wallet-currency-conversion/use-cases/commands/convert-wallet-currency.use-case';

@Injectable()
export class DeleteImagesUseCase extends UserBaseCase<UserImagesDto, void> {
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

  async execute ({ userId, indexes }: UserImagesDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    await this.storageService.delete(`user-${userId}`, indexes);
  }
}
