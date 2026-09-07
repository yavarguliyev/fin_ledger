import { Inject, Injectable } from '@nestjs/common';
import { CacheEvict, Cacheable, REDIS_CACHE_PROVIDER, RedisCacheProvider, RequestContext } from '@common/libs';

import { RequestDepositUseCase } from './use-cases/commands/request-deposit.use-case';
import { RequestWithdrawalUseCase } from './use-cases/commands/request-withdrawal.use-case';
import { GetPaymentUseCase } from './use-cases/queries/get-payment.use-case';
import { RequestPaymentDto } from './dtos/request/request-payment.dto';
import { PaymentDto } from './dtos/payment/payment.dto';

@Injectable()
export class PaymentService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;

  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly requestDepositUseCase: RequestDepositUseCase,
    private readonly requestWithdrawalUseCase: RequestWithdrawalUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async deposit (context: RequestContext, dto: RequestPaymentDto): Promise<PaymentDto> {
    return this.requestDepositUseCase.execute({ context, dto });
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async withdraw (context: RequestContext, dto: RequestPaymentDto): Promise<PaymentDto> {
    return this.requestWithdrawalUseCase.execute({ context, dto });
  }

  @Cacheable({ keyPrefix: 'payment', ttlSeconds: 180 })
  async getPayment (id: string): Promise<PaymentDto> {
    return this.getPaymentUseCase.execute(id);
  }
}
