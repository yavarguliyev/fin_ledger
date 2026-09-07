import { Injectable, Inject } from '@nestjs/common';
import { PostgresService, OutboxRepository, PaymentType, KAFKA_SERVICE } from '@common/libs';
import { KafkaService } from '@common/kafka';

import { PaymentRepository } from '../../repositories/payment.repository';
import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';
import { WalletService } from '../../../wallet/wallet.service';
import { PaymentBaseUseCase } from '../base/payment-base.use-case';
import { RequestPayment } from '../../dtos/request/request-payment.dto';
import { PaymentDto } from '../../dtos/payment/payment.dto';

@Injectable()
export class RequestDepositUseCase extends PaymentBaseUseCase<RequestPayment, PaymentDto> {
  protected readonly paymentType = PaymentType.DEPOSIT;

  constructor (
    protected override readonly postgresService: PostgresService,
    protected override readonly walletService: WalletService,
    protected override readonly paymentRepository: PaymentRepository,
    protected override readonly paymentMethodRepository: PaymentMethodRepository,
    protected override readonly outboxRepository: OutboxRepository,
    @Inject(KAFKA_SERVICE) kafkaService: KafkaService
  ) {
    super(postgresService, walletService, paymentRepository, paymentMethodRepository, outboxRepository, kafkaService);
  }

  protected validateWallet (): void {}

  async execute (input: RequestPayment): Promise<PaymentDto> {
    return this.processPayment(input);
  }
}
