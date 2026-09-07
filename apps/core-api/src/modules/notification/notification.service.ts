import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Cacheable, CacheEvict, REDIS_CACHE_PROVIDER, RedisCacheProvider, RequestContext } from '@common/libs';

import { CreateNotificationUseCase } from './use-cases/commands/create-notification.use-case';
import { GetNotificationsUseCase } from './use-cases/queries/get-notifications.use-case';
import { MarkNotificationReadUseCase } from './use-cases/commands/mark-notification-read.use-case';
import { NotificationStreamProvider } from './providers/notification-stream.provider';
import { CreateNotificationDto } from './dtos/notification/create-notification.dto';
import { NotificationDto } from './dtos/notification/notification.dto';

@Injectable()
export class NotificationService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;

  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly streamProvider: NotificationStreamProvider
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @CacheEvict({ keyPrefix: ['notification'], isPattern: true })
  async createNotification (dto: CreateNotificationDto): Promise<NotificationDto> {
    return this.createNotificationUseCase.execute(dto);
  }

  @Cacheable({ keyPrefix: 'notification:list', ttlSeconds: 30 })
  async getNotifications (context: RequestContext, limit?: number): Promise<NotificationDto[]> {
    return this.getNotificationsUseCase.execute({ context, limit });
  }

  @CacheEvict({ keyPrefix: ['notification'], isPattern: true })
  async markAsRead (notificationId: string, context: RequestContext): Promise<NotificationDto> {
    return this.markNotificationReadUseCase.execute({ notificationId, context });
  }

  getEventStream (context: RequestContext): Observable<NotificationDto> {
    return this.streamProvider.getStream(context);
  }
}
