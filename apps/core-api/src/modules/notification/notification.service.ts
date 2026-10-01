import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import { CreateNotificationUseCase } from './use-cases/commands/create-notification.use-case';
import { GetNotificationsUseCase } from './use-cases/queries/get-notifications.use-case';
import { MarkNotificationReadUseCase } from './use-cases/commands/mark-notification-read.use-case';
import { StreamNotificationsUseCase } from './use-cases/queries/stream-notifications.use-case';
import { NotificationDto } from './dtos/notification/notification.dto';
import { CreateNotificationDto } from './dtos/input/create-notification.dto';
import { ListNotificationsDto } from './dtos/input/list-notifications.dto';
import { MarkNotificationReadDto } from './dtos/input/mark-notification-read.dto';
import { GetNotificationStreamDto } from './dtos/input/get-notification-stream.dto';
import { IssueStreamTicketUseCase } from './use-cases/commands/issue-stream-ticket.use-case';
import { IssueStreamTicketRequestDto } from './dtos/input/issue-stream-ticket-request.dto';
import { StreamTicketResponseDto } from './dtos/response/stream-ticket-response.dto';

@Injectable()
export class NotificationService {
  constructor (
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly issueStreamTicketUseCase: IssueStreamTicketUseCase,
    private readonly streamNotificationsUseCase: StreamNotificationsUseCase
  ) {}

  async createNotification (dto: CreateNotificationDto): Promise<NotificationDto> {
    return this.createNotificationUseCase.execute(dto);
  }

  async getNotifications (dto: ListNotificationsDto): Promise<NotificationDto[]> {
    return this.getNotificationsUseCase.execute(dto);
  }

  async markAsRead (dto: MarkNotificationReadDto): Promise<NotificationDto> {
    return this.markNotificationReadUseCase.execute(dto);
  }

  async issueStreamTicket (dto: IssueStreamTicketRequestDto): Promise<StreamTicketResponseDto> {
    return this.issueStreamTicketUseCase.execute(dto);
  }

  getEventStream (dto: GetNotificationStreamDto): Observable<MessageEvent> {
    return this.streamNotificationsUseCase.execute(dto);
  }
}
