import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentType } from '@common/libs';

import { PaymentBaseUseCase } from '../base/payment-base.use-case';
import { ValidateWalletDto } from '../../dtos/step/validate-wallet.dto';

@Injectable()
export class RequestWithdrawalUseCase extends PaymentBaseUseCase {
  protected readonly paymentType = PaymentType.WITHDRAWAL;

  protected validateWallet ({ wallet, dto }: ValidateWalletDto): void {
    if (Number(wallet.availableBalanceMinor) < dto.amountMinor) {
      throw new BadRequestException('Insufficient funds for withdrawal');
    }
  }
}
