import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService, FileUrlsResponse, KAFKA_SERVICE, KafkaService, SessionService, PasswordHandler } from '@common/libs';

import { UserRepository } from '../../repositories/user.repository';
import { UserBaseCase } from '../base/user-base.use-case';
import { UserImagesDto } from '../../dtos/update/user-images.dto';
import { ConvertWalletCurrencyUseCase } from '../../../wallet-currency-conversion/use-cases/commands/convert-wallet-currency.use-case';

@Injectable()
export class GetImagesUseCase extends UserBaseCase<UserImagesDto, FileUrlsResponse> {
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

  async execute ({ userId, indexes }: UserImagesDto): Promise<FileUrlsResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const key = `user-${userId}`;

    try {
      const response = await this.storageService.get(key, indexes, 86400);
      return response as FileUrlsResponse;
    } catch (error) {
      if (error instanceof NotFoundException) return { key, expiresIn: 86400, files: [] };
      throw error;
    }
  }
}
