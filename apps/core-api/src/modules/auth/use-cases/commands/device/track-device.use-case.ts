import { Injectable, Logger } from '@nestjs/common';
import { BaseHelper, EmailTemplateType, OutboxDestination, PostgresService, RequestScope } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { UserDeviceRepository } from '../../../repositories/user-device.repository';
import { LoginEventRepository } from '../../../repositories/login-event.repository';
import { TrackDeviceDto } from '../../../dtos/device/track-device.dto';
import { PersistSightingDto } from '../../../dtos/device/persist-sighting.dto';
import { WriteSightingDto } from '../../../dtos/device/write-sighting.dto';
import { AlertNewDeviceDto } from '../../../dtos/device/alert-new-device.dto';
import { DEVICE } from '../../../constants/device/device.constant';
import { FRONTEND } from '../../../../../shared/constants/config/frontend.constant';

@Injectable()
export class TrackDeviceUseCase extends AuthBaseUseCase<TrackDeviceDto, void> {
  private readonly logger = new Logger(TrackDeviceUseCase.name);

  constructor (
    private readonly userDeviceRepository: UserDeviceRepository,
    private readonly loginEventRepository: LoginEventRepository,
    private readonly postgresService: PostgresService
  ) {
    super();
  }

  async execute ({ userId, email }: TrackDeviceDto): Promise<void> {
    const visitorId = RequestScope.deviceId();
    const userAgent = RequestScope.userAgent();
    const ip = RequestScope.clientIp();

    try {
      await RequestScope.runSystem(() => this.persist({ userId, email, visitorId, userAgent, ip }));
    } catch (error) {
      this.logger.warn(`Could not record the sign-in device for ${userId}: ${BaseHelper.errorResponse({ error }).message}`);
    }
  }

  private async persist (dto: PersistSightingDto): Promise<void> {
    await this.postgresService.getWriteConnection().transaction({ callback: async adapter => this.write({ ...dto, adapter }) });
  }

  private async write ({ userId, email, visitorId, userAgent, ip, adapter }: WriteSightingDto): Promise<void> {
    const seen = { ...(userAgent && { userAgent }), ...(ip && { ip }), adapter };

    if (!visitorId) {
      await this.loginEventRepository.record({ userId, isNewDevice: false, ...seen });
      return;
    }

    const { isNewDevice } = await this.userDeviceRepository.record({ userId, visitorId, ...seen });

    await this.loginEventRepository.record({ userId, visitorId, isNewDevice, ...seen });
    if (isNewDevice) await this.alert({ userId, email, adapter });
  }

  private async alert ({ userId, email, adapter }: AlertNewDeviceDto): Promise<void> {
    await this.outboxRepository.createEvent({
      adapter,
      aggregateType: DEVICE.AGGREGATE_TYPE,
      aggregateId: userId,
      eventType: EmailTemplateType.NEW_DEVICE,
      destination: OutboxDestination.KAFKA,
      payload: {
        to: email,
        subject: DEVICE.EMAIL.SUBJECT,
        purpose: DEVICE.EMAIL.PURPOSE,
        title: DEVICE.EMAIL.TITLE,
        body: DEVICE.EMAIL.BODY,
        url: `${this.configService.get<string>(FRONTEND.URL_KEY)}${DEVICE.PROFILE_PATH}`
      }
    });
  }
}
