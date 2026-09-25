import { BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseAdapter, EmailTemplateType, OutboxDestination, OutboxRepository, SendEmailDto, SessionService, StorageService } from '@common/libs';

import { UserRepository } from '../../repositories/user.repository';
import { ImageActionDto } from '../../dtos/helper/image-action.dto';

export abstract class UserBaseCase<TInput, TOutput> {
  @Inject(UserRepository)
  protected readonly userRepository!: UserRepository;

  @Inject(SessionService)
  protected readonly sessionService!: SessionService;

  @Inject(ConfigService)
  protected readonly configService!: ConfigService;

  @Inject(StorageService)
  protected readonly storageService!: StorageService;

  @Inject(OutboxRepository)
  protected readonly outboxRepository!: OutboxRepository;

  abstract execute(input: TInput): Promise<TOutput>;

  protected handleAddImages ({ request, user, updates }: ImageActionDto): void {
    if (!request.profileImages || request.profileImages.length === 0) throw new BadRequestException('Profile images are required for add action');
    updates.profileImages = [...user.profileImages, ...request.profileImages];
    if (request.profileImagesKey) updates.profileImagesKey = request.profileImagesKey;
  }

  protected async publishEmailVerification (eventPayload: SendEmailDto, userId: string, adapter?: DatabaseAdapter): Promise<SendEmailDto> {
    await this.outboxRepository.createEvent({
      aggregateType: 'User',
      aggregateId: userId,
      eventType: EmailTemplateType.EMAIL_VERIFICATION,
      payload: { ...eventPayload },
      destination: OutboxDestination.KAFKA,
      ...(adapter && { adapter })
    });

    return eventPayload;
  }

  protected async handleImageAction (dto: ImageActionDto): Promise<void> {
    switch (dto.request.imageAction) {
      case 'add':
        this.handleAddImages(dto);
        break;

      case 'delete_all':
        await this.handleDeleteAllImages(dto);
        break;

      case 'delete_by_index':
        await this.handleDeleteByIndex(dto);
        break;

      default:
        throw new BadRequestException('Invalid image action');
    }
  }

  protected async handleDeleteAllImages ({ user, updates }: ImageActionDto): Promise<void> {
    if (user.profileImagesKey) await this.storageService.delete({ key: user.profileImagesKey });
    updates.profileImages = [];
    updates.profileImageIndex = 0;
    updates.profileImagesKey = null;
  }

  protected async handleDeleteByIndex ({ request, user, updates }: ImageActionDto): Promise<void> {
    const { deleteIndexes } = request;
    if (!deleteIndexes || deleteIndexes.length === 0) throw new BadRequestException('Delete indexes are required for delete_by_index action');
    if (!user.profileImagesKey) throw new BadRequestException('No profile images key found');

    await this.storageService.delete({ key: user.profileImagesKey, indexes: deleteIndexes });

    const remainingImages = user.profileImages.filter((_, idx) => !deleteIndexes.includes(idx));
    updates.profileImages = remainingImages;

    if (remainingImages.length === 0) {
      updates.profileImagesKey = null;
      updates.profileImageIndex = 0;
    } else if (deleteIndexes.includes(user.profileImageIndex)) {
      updates.profileImageIndex = 0;
    }
  }
}
