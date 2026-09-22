import { Inject, Injectable } from '@nestjs/common';
import { CacheEvict, Cacheable, REDIS_CACHE_PROVIDER, RedisCacheProvider } from '@common/libs';

import { RequestWithdrawalUseCase } from './use-cases/commands/request-withdrawal.use-case';
import { RequestDepositUseCase } from './use-cases/commands/request-deposit.use-case';
import { GetPaymentUseCase } from './use-cases/queries/get-payment.use-case';
import { PaymentDto } from './dtos/payment/payment.dto';
import { PaymentResultDto } from './dtos/payment/payment-result.dto';
import { ProcessPaymentDto } from './dtos/input/process-payment.dto';
import { PaymentIdRequestDto } from './dtos/request/payment-id-request.dto';

@Injectable()
export class PaymentService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;

  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly requestWithdrawalUseCase: RequestWithdrawalUseCase,
    private readonly requestDepositUseCase: RequestDepositUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async deposit (dto: ProcessPaymentDto): Promise<PaymentResultDto> {
    return this.requestDepositUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async withdraw (dto: ProcessPaymentDto): Promise<PaymentResultDto> {
    return this.requestWithdrawalUseCase.execute(dto);
  }

  @Cacheable({ keyPrefix: 'payment', ttlSeconds: 180 })
  async getPayment (dto: PaymentIdRequestDto): Promise<PaymentDto> {
    return this.getPaymentUseCase.execute(dto);
  }
}
