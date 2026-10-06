import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { AddressDto } from '../dtos/address/address.dto';
import { SaveAddressDto } from '../dtos/address/save-address.dto';
import { USER_ADDRESS } from '../constants/address/user-address.constant';
import { UserIdRequestDto } from '../dtos/request/user-id-request.dto';

@Injectable()
export class UserAddressRepository extends BaseExtendedRepository<AddressDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: USER_ADDRESS.TABLE,
      columnMappings: { postalCode: 'postal_code', countryCode: 'country_code', updatedAt: 'updated_at' }
    });
  }

  protected getSelectColumns (): string[] {
    return ['line1', 'line2', 'city', 'region', 'postalCode', 'countryCode', 'latitude', 'longitude', 'source', 'updatedAt'];
  }

  async findForUser ({ userId }: UserIdRequestDto): Promise<AddressDto | null> {
    const result = await this.service.getWriteConnection().query<AddressDto>({ sql: USER_ADDRESS.SELECT_SQL, params: [userId] });
    return result.rows[0] ?? null;
  }

  async save ({ userId, line1, line2, city, region, postalCode, countryCode, latitude, longitude, source }: SaveAddressDto): Promise<AddressDto | null> {
    const result = await this.service.getWriteConnection().query<AddressDto>({
      sql: USER_ADDRESS.UPSERT_SQL,
      params: [userId, line1, line2 ?? null, city, region ?? null, postalCode ?? null, countryCode, latitude ?? null, longitude ?? null, source]
    });

    return result.rows[0] ?? null;
  }

  async remove ({ userId }: UserIdRequestDto): Promise<void> {
    await this.service.getWriteConnection().query({ sql: USER_ADDRESS.DELETE_SQL, params: [userId] });
  }
}
