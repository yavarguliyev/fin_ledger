import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { PaymentStatus } from '@common/libs';

import { PaymentRepository } from '../../repositories/payment.repository';
import { PaymentIdRequestDto } from '../../dtos/request/payment-id-request.dto';
import { RECEIPT } from '../../constants/receipt/receipt.constant';
import { ReceiptHelper } from '../../helpers/receipt.helper';
import { AuthRepository } from '../../../auth/repositories/auth.repository';
import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';

@Injectable()
export class GetPaymentReceiptUseCase {
  constructor (
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly authRepository: AuthRepository
  ) {}

  async execute ({ id }: PaymentIdRequestDto): Promise<StreamableFile> {
    const payment = await this.paymentRepository.findById({ id });
    if (!payment) throw new NotFoundException(RECEIPT.NOT_FOUND);
    if (payment.status !== PaymentStatus.COMPLETED) throw new NotFoundException(RECEIPT.NOT_AVAILABLE);

    const method = payment.paymentMethodId ? await this.paymentMethodRepository.findById({ id: payment.paymentMethodId }) : null;
    const customer = await this.authRepository.findById({ id: payment.userId });
    const receipt = ReceiptHelper.fromPayment({
      payment,
      customerName: customer?.displayName ?? RECEIPT.EMPTY,
      cardBrand: method?.cardBrand ?? null,
      lastFour: method?.lastFour ?? null
    });

    return new StreamableFile(await ReceiptHelper.toPdf({ receipt }), {
      type: RECEIPT.CONTENT_TYPE,
      disposition: `${RECEIPT.DISPOSITION_PREFIX}${receipt.receiptNumber}${RECEIPT.DISPOSITION_SUFFIX}`
    });
  }
}
