import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  KAFKA_SERVICE,
  EmailTemplateType,
  EXTRACT_ID_KEY,
  KafkaPublish,
  KafkaService,
  SendEmailDto,
  StorageService,
  SessionService,
  PasswordHandler
} from '@common/libs';

import { UpdateUserDto } from '../../dtos/update/update-user.dto';
import { UserDto } from '../../dtos/user/user.dto';
import { UserRepository } from '../../repositories/user.repository';
import { ConvertWalletCurrencyUseCase } from '../../../wallet-currency-conversion/use-cases/commands/convert-wallet-currency.use-case';

@Injectable()
export abstract class UserBaseCase<TInput, TOutput> {
  protected readonly webCompatibleFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  protected readonly [KAFKA_SERVICE]: KafkaService;

  constructor (
    protected readonly storageService: StorageService,
    protected readonly userRepository: UserRepository,
    protected readonly sessionService: SessionService,
    protected readonly configService: ConfigService,
    protected readonly convertWalletCurrencyUseCase: ConvertWalletCurrencyUseCase,
    protected readonly passwordHelper: PasswordHandler,
    @Inject(KAFKA_SERVICE) kafkaService: KafkaService
  ) {
    this[KAFKA_SERVICE] = kafkaService;
  }

  protected abstract execute(input: TInput): Promise<TOutput>;

  @KafkaPublish({ topic: EmailTemplateType.EMAIL_VERIFICATION, key: (result: unknown) => EXTRACT_ID_KEY(result, 'userId') })
  protected async publishEmailVerification (eventPayload: SendEmailDto): Promise<SendEmailDto> {
    return Promise.resolve(eventPayload);
  }

  protected async handleImageAction (dto: UpdateUserDto, user: UserDto, updates: Partial<UserDto>): Promise<void> {
    switch (dto.imageAction) {
      case 'add':
        this.handleAddImages(dto, user, updates);
        break;

      case 'delete_all':
        await this.handleDeleteAllImages(user, updates);
        break;

      case 'delete_by_index':
        await this.handleDeleteByIndex(dto, user, updates);
        break;

      default:
        throw new BadRequestException('Invalid image action');
    }
  }

  protected handleAddImages (dto: UpdateUserDto, user: UserDto, updates: Partial<UserDto>): void {
    if (!dto.profileImages || dto.profileImages.length === 0) throw new BadRequestException('Profile images are required for add action');
    const mergedImages = [...user.profileImages, ...dto.profileImages];
    updates.profileImages = mergedImages;
    if (dto.profileImagesKey) updates.profileImagesKey = dto.profileImagesKey;
  }

  protected async handleDeleteAllImages (user: UserDto, updates: Partial<UserDto>): Promise<void> {
    if (user.profileImagesKey) await this.storageService.delete(user.profileImagesKey);
    updates.profileImages = [];
    updates.profileImageIndex = 0;
    updates.profileImagesKey = null;
  }

  protected async handleDeleteByIndex (dto: UpdateUserDto, user: UserDto, updates: Partial<UserDto>): Promise<void> {
    if (!dto.deleteIndexes || dto.deleteIndexes.length === 0) throw new BadRequestException('Delete indexes are required for delete_by_index action');
    if (!user.profileImagesKey) throw new BadRequestException('No profile images key found');

    await this.storageService.delete(user.profileImagesKey, dto.deleteIndexes);

    const remainingImages = user.profileImages.filter((_, idx) => !dto.deleteIndexes!.includes(idx));
    updates.profileImages = remainingImages;

    if (remainingImages.length === 0) {
      updates.profileImagesKey = null;
      updates.profileImageIndex = 0;
    } else if (dto.deleteIndexes.includes(user.profileImageIndex)) {
      updates.profileImageIndex = 0;
    }
  }
}
