import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { KAFKA_SERVICE, KafkaService, OutboxRepository, PaymentType, PostgresService } from '@common/libs';

import { PaymentRepository } from '../../repositories/payment.repository';
import { PaymentDto } from '../../dtos/payment/payment.dto';
import { PaymentBaseUseCase } from '../base/payment-base.use-case';
import { WalletService } from '../../../wallet/wallet.service';
import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';

@Injectable()
export class GetPaymentUseCase extends PaymentBaseUseCase<string, PaymentDto> {
  protected readonly paymentType = PaymentType.GET;

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

  async execute (id: string): Promise<PaymentDto> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
