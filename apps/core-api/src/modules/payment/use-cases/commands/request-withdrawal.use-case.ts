import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentType } from '@common/libs';

import { PaymentBaseUseCase } from '../base/payment-base.use-case';
import { RequestPayment, RequestPaymentDto } from '../../dtos/request/request-payment.dto';
import { WalletSummaryDto } from '../../../wallet/dtos/wallet/wallet-summary.dto';
import { PaymentDto } from '../../dtos/payment/payment.dto';

@Injectable()
export class RequestWithdrawalUseCase extends PaymentBaseUseCase<RequestPayment, PaymentDto> {
  protected readonly paymentType = PaymentType.WITHDRAWAL;

  constructor () {
    super();
  }

  protected validateWallet (wallet: WalletSummaryDto, dto: RequestPaymentDto): void {
    if (Number(wallet.availableBalanceMinor) < dto.amountMinor) {
      throw new BadRequestException('Insufficient funds for withdrawal');
    }
  }
}
