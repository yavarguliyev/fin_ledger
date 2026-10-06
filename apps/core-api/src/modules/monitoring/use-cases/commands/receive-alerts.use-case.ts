import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateType, NotificationType, OutboxDestination, OutboxRepository, RequestScope } from '@common/libs';

import { AdminRecipientRepository } from '../../repositories/admin-recipient.repository';
import { AlertDeliveryDto } from '../../dtos/alert/alert-delivery.dto';
import { AlertMessageHelper } from '../../helpers/alert-message.helper';
import { FRONTEND } from '../../../../shared/constants/config/frontend.constant';
import { MONITORING } from '../../constants/monitoring.constant';
import { NotificationService } from '../../../notification';
import { ReceiveAlertsDto } from '../../dtos/input/receive-alerts.dto';

@Injectable()
export class ReceiveAlertsUseCase {
  constructor (
    private readonly admins: AdminRecipientRepository,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    @Inject(OutboxRepository) private readonly outboxRepository: OutboxRepository
  ) {}

  async execute ({ authorization, alerts }: ReceiveAlertsDto): Promise<void> {
    const expected = this.configService.get<string>(MONITORING.TOKEN_KEY);
    if (!AlertMessageHelper.isAuthorized({ ...(authorization && { authorization }), ...(expected && { expected }) })) {
      throw new UnauthorizedException(MONITORING.UNAUTHORIZED_MESSAGE);
    }

    await RequestScope.runSystem(async () => {
      const admins = await this.admins.findActive();
      for (const alert of alerts) {
        const message = AlertMessageHelper.describe({ alert });
        await Promise.all(admins.map(admin => this.deliver({ admin, message })));
      }
    });
  }

  private async deliver ({ admin, message }: AlertDeliveryDto): Promise<void> {
    await this.notificationService.createNotification({ userId: admin.id, title: message.title, content: message.content, type: NotificationType.SYSTEM });
    await this.outboxRepository.createEvent({
      aggregateType: MONITORING.AGGREGATE_TYPE,
      aggregateId: admin.id,
      eventType: EmailTemplateType.MONITORING_ALERT,
      payload: {
        to: admin.email,
        subject: message.title,
        purpose: MONITORING.EMAIL_PURPOSE,
        title: message.title,
        body: message.content,
        url: `${this.configService.get<string>(FRONTEND.URL_KEY) ?? ''}${MONITORING.ADMIN_PATH}`
      },
      destination: OutboxDestination.KAFKA
    });
  }
}
