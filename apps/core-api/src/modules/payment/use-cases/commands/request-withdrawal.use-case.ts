import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { KAFKA_SERVICE, OutboxRepository, PaymentType, PostgresService } from '@common/libs';
import { KafkaService } from '@common/kafka';

import { PaymentRepository } from '../../repositories/payment.repository';
import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';
import { WalletService } from '../../../wallet/wallet.service';
import { PaymentBaseUseCase } from '../base/payment-base.use-case';
import { RequestPayment, RequestPaymentDto } from '../../dtos/request/request-payment.dto';
import { WalletSummaryDto } from '../../../wallet/dtos/wallet/wallet-summary.dto';
import { PaymentDto } from '../../dtos/payment/payment.dto';

@Injectable()
export class RequestWithdrawalUseCase extends PaymentBaseUseCase<RequestPayment, PaymentDto> {
  protected readonly paymentType = PaymentType.WITHDRAWAL;

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

  protected validateWallet (wallet: WalletSummaryDto, dto: RequestPaymentDto): void {
    if (Number(wallet.availableBalanceMinor) < dto.amountMinor) throw new BadRequestException('Insufficient funds for withdrawal');
  }

  async execute (input: RequestPayment): Promise<PaymentDto> {
    return this.processPayment(input);
  }
}
