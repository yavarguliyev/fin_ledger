import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CacheEvict, Cacheable, getSessionUser, REDIS_CACHE_PROVIDER, RedisCacheProvider, RequestContext, WorkflowStepStatus } from '@common/libs';

import { RequestWithdrawalUseCase } from './use-cases/commands/request-withdrawal.use-case';
import { GetPaymentUseCase } from './use-cases/queries/get-payment.use-case';
import { RequestPaymentDto } from './dtos/request/request-payment.dto';
import { PaymentDto } from './dtos/payment/payment.dto';
import { DepositOrchestratorWorkflow } from './workflows/deposit-orchestrator.workflow';

@Injectable()
export class PaymentService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;

  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly requestWithdrawalUseCase: RequestWithdrawalUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly depositOrchestrator: DepositOrchestratorWorkflow
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async deposit (context: RequestContext, dto: RequestPaymentDto): Promise<PaymentDto> {
    const { userId } = getSessionUser(context);
    const { context: depositContext, executionLog } = await this.depositOrchestrator.execute({ userId, dto });

    const failedStep = executionLog.find(log => log.status === WorkflowStepStatus.FAILED);
    if (failedStep || !depositContext.payment) throw new BadRequestException(`Payment deposit failed at: ${failedStep?.stepName ?? 'unknown'}`);

    return depositContext.payment;
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
