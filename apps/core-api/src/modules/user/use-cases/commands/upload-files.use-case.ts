import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KAFKA_SERVICE, KafkaService, PasswordHandler, SessionService, StorageService, UploadFileResponse, convertToWebFormat } from '@common/libs';

import { UserRepository } from '../../repositories/user.repository';
import { UserBaseCase } from '../base/user-base.use-case';
import { UserUpload } from '../../dtos/update/update-user.dto';
import { ConvertWalletCurrencyUseCase } from '../../../wallet-currency-conversion/use-cases/commands/convert-wallet-currency.use-case';

@Injectable()
export class UploadFilesUseCase extends UserBaseCase<UserUpload, UploadFileResponse> {
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

  async execute ({ userId, files }: UserUpload): Promise<UploadFileResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const processedFiles = await Promise.all(
      files.map(async file => {
        if (this.webCompatibleFormats.includes(file.mimetype)) return file;
        return convertToWebFormat(file);
      })
    );

    return this.storageService.uploadFiles({ key: `user-${userId}`, files: processedFiles });
  }
}
