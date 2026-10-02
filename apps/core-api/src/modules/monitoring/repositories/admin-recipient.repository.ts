import { Inject, Injectable } from '@nestjs/common';
import { PostgresService } from '@common/libs';

import { MONITORING } from '../constants/monitoring.constant';
import { AdminRecipient } from '../interfaces/admin-recipient.interface';

@Injectable()
export class AdminRecipientRepository {
  constructor (@Inject(PostgresService) private readonly postgresService: PostgresService) {}

  async findActive (): Promise<AdminRecipient[]> {
    const result = await this.postgresService.getConnection().query<AdminRecipient>({ sql: MONITORING.ADMINS_SQL });
    return result.rows;
  }
}
