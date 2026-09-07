import { Inject, Injectable } from '@nestjs/common';
import { Cacheable, CacheEvict, PaymentMethodStatus, REDIS_CACHE_PROVIDER, RedisCacheProvider } from '@common/libs';

import { CreatePaymentMethodUseCase } from './use-cases/commands/create-payment-method.use-case';
import { RemovePaymentMethodUseCase } from './use-cases/commands/remove-payment-method.use-case';
import { VerifyPaymentMethodUseCase } from './use-cases/commands/verify-payment-method.use-case';
import { ListPaymentMethodsUseCase } from './use-cases/queries/list-payment-methods.use-case';
import { GetPaymentMethodUseCase } from './use-cases/queries/get-payment-method.use-case';
import { CreatePaymentMethodDto } from './dtos/request/create-payment-method.dto';
import { PaymentMethodDto } from './dtos/payment-method/payment-method.dto';

@Injectable()
export class PaymentMethodService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;

  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly createPaymentMethodUseCase: CreatePaymentMethodUseCase,
    private readonly removePaymentMethodUseCase: RemovePaymentMethodUseCase,
    private readonly verifyPaymentMethodUseCase: VerifyPaymentMethodUseCase,
    private readonly listPaymentMethodsUseCase: ListPaymentMethodsUseCase,
    private readonly getPaymentMethodUseCase: GetPaymentMethodUseCase
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @CacheEvict({ keyPrefix: ['payment-method'], isPattern: true })
  async createPaymentMethod (userId: string, dto: CreatePaymentMethodDto): Promise<PaymentMethodDto> {
    return this.createPaymentMethodUseCase.execute({ ...dto, userId });
  }

  @CacheEvict({ keyPrefix: ['payment-method'], isPattern: true })
  async removePaymentMethod (id: string, userId: string): Promise<PaymentMethodDto> {
    return this.removePaymentMethodUseCase.execute({ id, userId });
  }

  @CacheEvict({ keyPrefix: ['payment-method'], isPattern: true })
  async verifyPaymentMethod (id: string, userId: string): Promise<PaymentMethodDto> {
    return this.verifyPaymentMethodUseCase.execute({ id, userId });
  }

  @Cacheable({ keyPrefix: 'payment-method:list', ttlSeconds: 120 })
  async listPaymentMethods (userId: string, status?: PaymentMethodStatus): Promise<PaymentMethodDto[]> {
    return this.listPaymentMethodsUseCase.execute({ userId, status });
  }

  @Cacheable({ keyPrefix: 'payment-method', ttlSeconds: 120 })
  async getPaymentMethod (id: string, userId: string): Promise<PaymentMethodDto> {
    return this.getPaymentMethodUseCase.execute({ id, userId });
  }
}
