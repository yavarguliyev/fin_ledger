import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { AdminRecipient } from '../interfaces/admin-recipient.interface';
import { MONITORING } from '../constants/monitoring.constant';

@Injectable()
export class AdminRecipientRepository extends BaseExtendedRepository<AdminRecipient> {
  constructor (postgresService: PostgresService) {
    super({ service: postgresService, tableName: MONITORING.USERS_TABLE });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'email'];
  }

  async findActive (): Promise<AdminRecipient[]> {
    const result = await this.service.getConnection().query<AdminRecipient>({ sql: MONITORING.ADMINS_SQL });
    return result.rows;
  }
}
