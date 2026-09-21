import { Injectable } from '@nestjs/common';
import { BaseRepository, PaymentMethodStatus, PostgresService, WhereCondition } from '@common/libs';

import { PaymentMethodDto } from '../dtos/payment-method/payment-method.dto';
import { ListPaymentMethodsDto } from '../dtos/input/list-payment-methods.dto';
import { PaymentMethodByUserDto } from '../dtos/input/payment-method-by-user.dto';
import { PaymentMethodIdRequestDto } from '../dtos/request/payment-method-id-request.dto';
import { FindByProviderMethodIdDto } from '../dtos/repository/find-by-provider-method-id.dto';
import { UpdatePaymentMethodStatusDto } from '../dtos/repository/update-payment-method-status.dto';

@Injectable()
export class PaymentMethodRepository extends BaseRepository<PaymentMethodDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'payment_methods',
      columnMappings: {
        userId: 'user_id',
        accountHolder: 'account_holder',
        lastFour: 'last_four',
        bankName: 'bank_name',
        provider: 'provider',
        providerMethodId: 'provider_method_id',
        cardBrand: 'card_brand',
        walletType: 'wallet_type',
        expiryMonth: 'expiry_month',
        expiryYear: 'expiry_year',
        fingerprint: 'fingerprint',
        failureReason: 'failure_reason',
        isDefault: 'is_default',
        verifiedAt: 'verified_at',
        deletedAt: 'deleted_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return [
      'id',
      'userId',
      'type',
      'accountHolder',
      'lastFour',
      'bankName',
      'provider',
      'providerMethodId',
      'cardBrand',
      'walletType',
      'expiryMonth',
      'expiryYear',
      'fingerprint',
      'failureReason',
      'status',
      'isDefault',
      'verifiedAt',
      'metadata',
      'createdAt',
      'updatedAt'
    ];
  }

  async findByUser ({ userId, status }: ListPaymentMethodsDto): Promise<PaymentMethodDto[]> {
    const where: WhereCondition[] = [
      { field: 'user_id', operator: '=', value: userId },
      { field: 'status', operator: '!=', value: PaymentMethodStatus.REMOVED }
    ];

    if (status) {
      where.push({ field: 'status', operator: '=', value: status });
    }

    return this.findAll({ where, orderBy: 'created_at', orderDirection: 'DESC' });
  }

  async findByIdAndUserId ({ id, userId }: PaymentMethodByUserDto): Promise<PaymentMethodDto | null> {
    return this.findOne({ where: { id, user_id: userId } });
  }

  async findByProviderMethodId ({ provider, providerMethodId }: FindByProviderMethodIdDto): Promise<PaymentMethodDto | null> {
    return this.findOne({ where: { provider, provider_method_id: providerMethodId } });
  }

  async createPaymentMethod (data: Partial<PaymentMethodDto>): Promise<PaymentMethodDto | null> {
    return this.create({ data });
  }

  async updateStatus ({ id, status }: UpdatePaymentMethodStatusDto): Promise<PaymentMethodDto | null> {
    return this.update({ id, data: { status, verifiedAt: status === PaymentMethodStatus.VERIFIED ? new Date() : null } });
  }

  async markRemoved ({ id }: PaymentMethodIdRequestDto): Promise<PaymentMethodDto | null> {
    return this.update({ id, data: { status: PaymentMethodStatus.REMOVED, verifiedAt: null, isDefault: false, deletedAt: new Date() } });
  }
}
