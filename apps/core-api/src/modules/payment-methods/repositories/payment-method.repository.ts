import { Injectable } from '@nestjs/common';
import { BaseRepository, DatabaseAdapter, PaymentMethodStatus, PostgresService, WhereCondition } from '@common/libs';

import { PaymentMethodDto } from '../dtos/payment-method/payment-method.dto';

@Injectable()
export class PaymentMethodRepository extends BaseRepository<PaymentMethodDto> {
  constructor (postgresService: PostgresService) {
    super(postgresService, 'payment_methods', {
      userId: 'user_id',
      accountHolder: 'account_holder',
      maskedAccount: 'masked_account',
      bankName: 'bank_name',
      provider: 'provider',
      providerMethodId: 'provider_method_id',
      cardBrand: 'card_brand',
      walletType: 'wallet_type',
      expiryMonth: 'expiry_month',
      expiryYear: 'expiry_year',
      cvv: 'cvv',
      failureReason: 'failure_reason',
      isDefault: 'is_default',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  }

  protected getSelectColumns (): string[] {
    return [
      'id',
      'userId',
      'type',
      'accountHolder',
      'maskedAccount',
      'bankName',
      'provider',
      'providerMethodId',
      'cardBrand',
      'walletType',
      'expiryMonth',
      'expiryYear',
      'cvv',
      'failureReason',
      'status',
      'isDefault',
      'metadata',
      'createdAt',
      'updatedAt'
    ];
  }

  async findByUserId (userId: string, status?: PaymentMethodStatus, adapter?: DatabaseAdapter): Promise<PaymentMethodDto[]> {
    const where: WhereCondition[] = [
      { field: 'user_id', operator: '=', value: userId },
      { field: 'status', operator: '!=', value: PaymentMethodStatus.REMOVED }
    ];

    if (status) {
      where.push({ field: 'status', operator: '=', value: status });
    }

    return this.findAll({ where, orderBy: 'created_at', orderDirection: 'DESC' }, adapter);
  }

  async findByIdAndUserId (id: string, userId: string, adapter?: DatabaseAdapter): Promise<PaymentMethodDto | null> {
    return this.findOne({ id, user_id: userId }, adapter);
  }

  async findByProviderMethodId (provider: string, providerMethodId: string, adapter?: DatabaseAdapter): Promise<PaymentMethodDto | null> {
    return this.findOne({ provider, provider_method_id: providerMethodId }, adapter);
  }

  async createPaymentMethod (data: Partial<PaymentMethodDto>, adapter?: DatabaseAdapter): Promise<PaymentMethodDto | null> {
    return this.create(data, undefined, adapter);
  }

  async updateStatus (id: string, status: PaymentMethodStatus, adapter?: DatabaseAdapter): Promise<PaymentMethodDto | null> {
    return this.update(id, { status }, undefined, adapter);
  }
}
