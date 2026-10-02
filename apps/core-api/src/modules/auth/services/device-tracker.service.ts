import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHelper, EmailTemplateType, OutboxDestination, OutboxRepository, RequestScope } from '@common/libs';

import { UserDeviceRepository } from '../repositories/user-device.repository';
import { LoginEventRepository } from '../repositories/login-event.repository';
import { TrackDeviceDto } from '../dtos/device/track-device.dto';
import { PersistSightingDto } from '../dtos/device/persist-sighting.dto';
import { SharedDeviceDto } from '../dtos/device/shared-device.dto';
import { DEVICE } from '../constants/device/device.constant';
import { FRONTEND } from '../../../shared/constants/config/frontend.constant';

@Injectable()
export class DeviceTrackerService {
  private readonly logger = new Logger(DeviceTrackerService.name);

  constructor (
    @Inject(OutboxRepository) private readonly outboxRepository: OutboxRepository,
    @Inject(ConfigService) private readonly configService: ConfigService,
    private readonly userDeviceRepository: UserDeviceRepository,
    private readonly loginEventRepository: LoginEventRepository
  ) {}

  async track ({ userId, email }: TrackDeviceDto): Promise<void> {
    const visitorId = RequestScope.deviceId();
    const userAgent = RequestScope.userAgent();
    const ip = RequestScope.clientIp();

    try {
      await RequestScope.runSystem(() => this.persist({ userId, email, visitorId, userAgent, ip }));
    } catch (error) {
      this.logger.warn(`Could not record the sign-in device for ${userId}: ${BaseHelper.errorResponse({ error }).message}`);
    }
  }

  async sharedDevices (): Promise<SharedDeviceDto[]> {
    return this.userDeviceRepository.findSharedDevices();
  }

  private async persist ({ userId, email, visitorId, userAgent, ip }: PersistSightingDto): Promise<void> {
    const seen = { ...(userAgent && { userAgent }), ...(ip && { ip }) };

    if (!visitorId) {
      await this.loginEventRepository.record({ userId, isNewDevice: false, ...seen });
      return;
    }

    const { isNewDevice } = await this.userDeviceRepository.record({ userId, visitorId, ...seen });

    await this.loginEventRepository.record({ userId, visitorId, isNewDevice, ...seen });
    if (isNewDevice) await this.alert({ userId, email });
  }

  private async alert ({ userId, email }: TrackDeviceDto): Promise<void> {
    await this.outboxRepository.createEvent({
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
