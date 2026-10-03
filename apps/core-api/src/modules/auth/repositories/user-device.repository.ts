import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService } from '@common/libs';

import { UserDeviceDto } from '../dtos/device/user-device.dto';
import { RecordDeviceDto } from '../dtos/device/record-device.dto';
import { DeviceSightingDto } from '../dtos/device/device-sighting.dto';
import { SharedDeviceDto } from '../dtos/device/shared-device.dto';
import { DEVICE } from '../constants/device/device.constant';

@Injectable()
export class UserDeviceRepository extends BaseRepository<UserDeviceDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'user_devices',
      columnMappings: {
        userId: 'user_id',
        visitorId: 'visitor_id',
        userAgent: 'user_agent',
        lastIp: 'last_ip',
        firstSeenAt: 'first_seen_at',
        lastSeenAt: 'last_seen_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'userId', 'visitorId', 'userAgent', 'lastIp', 'firstSeenAt', 'lastSeenAt'];
  }

  async record ({ userId, visitorId, userAgent, ip, adapter }: RecordDeviceDto): Promise<DeviceSightingDto> {
    const existing = await this.findOne({ where: { userId, visitorId }, ...(adapter && { adapter }) });
    const seenAt = new Date().toISOString();

    if (existing) {
      await this.update({ id: existing.id, data: { lastSeenAt: seenAt, ...(ip && { lastIp: ip }), ...(userAgent && { userAgent }) }, ...(adapter && { adapter }) });
      return { isNewDevice: false };
    }

    await this.create({
      data: { userId, visitorId, firstSeenAt: seenAt, lastSeenAt: seenAt, ...(ip && { lastIp: ip }), ...(userAgent && { userAgent }) },
      ...(adapter && { adapter })
    });

    return { isNewDevice: true };
  }

  async findSharedDevices (): Promise<SharedDeviceDto[]> {
    const result = await this.service.getConnection().query<SharedDeviceDto>({
      sql: DEVICE.SHARED_SQL,
      params: [DEVICE.SHARED_DEVICE_MIN_ACCOUNTS, DEVICE.SHARED_DEVICE_LIMIT]
    });

    return result.rows;
  }
}
