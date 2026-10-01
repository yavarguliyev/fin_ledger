import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService } from '@common/libs';

import { ProviderCustomerDto } from '../dtos/provider-customer/provider-customer.dto';
import { FindProviderCustomerDto } from '../dtos/provider-customer/find-provider-customer.dto';
import { RememberProviderCustomerDto } from '../dtos/provider-customer/remember-provider-customer.dto';

@Injectable()
export class ProviderCustomerRepository extends BaseRepository<ProviderCustomerDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'provider_customers',
      columnMappings: {
        userId: 'user_id',
        providerCustomerId: 'provider_customer_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'userId', 'provider', 'providerCustomerId', 'createdAt', 'updatedAt'];
  }

  async findCustomerId ({ userId, provider }: FindProviderCustomerDto): Promise<string | null> {
    const existing = await this.findOne({ where: { userId, provider } });

    return existing?.providerCustomerId ?? null;
  }

  async remember ({ userId, provider, providerCustomerId }: RememberProviderCustomerDto): Promise<void> {
    const existing = await this.findOne({ where: { userId, provider } });

    if (existing) {
      await this.update({ id: existing.id, data: { providerCustomerId } });
      return;
    }

    await this.create({ data: { userId, provider, providerCustomerId } });
  }
}
