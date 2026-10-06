import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService, STAFF_ROLES } from '@common/libs';

import { ContactCardResponseDto } from '../dtos/response/contact-card-response.dto';
import { ContactNameDto } from '../dtos/contact/contact-name.dto';
import { StaffRefDto } from '../dtos/input/staff-ref.dto';
import { SUPPORT_CONTACT_SQL } from '../constants/chat/support-contact-sql.constant';
import { SupportContactDto } from '../dtos/contact/support-contact.dto';
import { UserRefDto } from '../dtos/input/user-ref.dto';

@Injectable()
export class SupportContactRepository extends BaseExtendedRepository<SupportContactDto> {
  constructor (postgresService: PostgresService) {
    super({ service: postgresService, tableName: SUPPORT_CONTACT_SQL.TABLE, columnMappings: { userId: 'id', displayName: 'display_name' } });
  }

  protected getSelectColumns (): string[] {
    return ['userId', 'displayName', 'role'];
  }

  async listStaff ({ userId }: UserRefDto): Promise<SupportContactDto[]> {
    const result = await this.service.getWriteConnection().query<SupportContactDto>({ sql: SUPPORT_CONTACT_SQL.LIST_STAFF, params: [STAFF_ROLES, userId] });
    return result.rows;
  }

  async findStaff ({ staffUserId }: StaffRefDto): Promise<SupportContactDto | null> {
    const result = await this.service.getWriteConnection().query<SupportContactDto>({ sql: SUPPORT_CONTACT_SQL.FIND_STAFF, params: [staffUserId, STAFF_ROLES] });
    return result.rows[0] ?? null;
  }

  async customerCard ({ userId }: UserRefDto): Promise<ContactCardResponseDto | null> {
    const result = await this.service.getWriteConnection().query<ContactCardResponseDto>({ sql: SUPPORT_CONTACT_SQL.CUSTOMER_CARD, params: [userId] });
    return result.rows[0] ?? null;
  }

  async findName ({ userId }: UserRefDto): Promise<ContactNameDto | null> {
    const result = await this.service.getWriteConnection().query<ContactNameDto>({ sql: SUPPORT_CONTACT_SQL.NAME, params: [userId] });
    return result.rows[0] ?? null;
  }
}
