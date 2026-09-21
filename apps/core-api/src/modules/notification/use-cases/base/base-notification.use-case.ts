import { Inject } from '@nestjs/common';

import { NotificationRepository } from '../../repositories/notification.repository';
import { NotificationStreamProvider } from '../../providers/notification-stream.provider';

export abstract class NotificationBaseUseCase<TInput, TOutput> {
  @Inject(NotificationRepository)
  protected readonly notificationRepository!: NotificationRepository;

  @Inject(NotificationStreamProvider)
  protected readonly streamProvider!: NotificationStreamProvider;

  abstract execute(input: TInput): Promise<TOutput>;
}
