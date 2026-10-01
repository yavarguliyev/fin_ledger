import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService } from '@common/libs';

import { LoginEventDto } from '../dtos/device/login-event.dto';
import { RecordLoginEventDto } from '../dtos/device/record-login-event.dto';

@Injectable()
export class LoginEventRepository extends BaseRepository<LoginEventDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'login_events',
      columnMappings: {
        userId: 'user_id',
        visitorId: 'visitor_id',
        userAgent: 'user_agent',
        isNewDevice: 'is_new_device',
        createdAt: 'created_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'userId', 'visitorId', 'userAgent', 'ip', 'isNewDevice', 'createdAt'];
  }

  async record ({ userId, visitorId, userAgent, ip, isNewDevice }: RecordLoginEventDto): Promise<void> {
    await this.create({
      data: { userId, isNewDevice, visitorId: visitorId ?? null, userAgent: userAgent ?? null, ip: ip ?? null }
    });
  }
}
