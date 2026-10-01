import { Injectable } from '@nestjs/common';
import { PostgresService, STAFF_ROLES } from '@common/libs';

import { StaffRefDto } from '../dtos/input/staff-ref.dto';
import { SUPPORT_CONTACT_SQL } from '../constants/chat/support-contact-sql.constant';
import { SupportContactDto } from '../dtos/contact/support-contact.dto';
import { UserRefDto } from '../dtos/input/user-ref.dto';

@Injectable()
export class SupportContactRepository {
  constructor (private readonly postgresService: PostgresService) {}

  async listStaff ({ userId }: UserRefDto): Promise<SupportContactDto[]> {
    const result = await this.postgresService.getWriteConnection().query<SupportContactDto>({
      sql: SUPPORT_CONTACT_SQL.LIST_STAFF,
      params: [STAFF_ROLES, userId]
    });

    return result.rows;
  }

  async findStaff ({ staffUserId }: StaffRefDto): Promise<SupportContactDto | null> {
    const result = await this.postgresService.getWriteConnection().query<SupportContactDto>({
      sql: SUPPORT_CONTACT_SQL.FIND_STAFF,
      params: [staffUserId, STAFF_ROLES]
    });

    return result.rows[0] ?? null;
  }
}
