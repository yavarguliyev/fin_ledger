import { Injectable } from '@nestjs/common';
import { ResourceOwnerGuard, ResourceOwnershipDto } from '@common/libs';

import { PaymentRepository } from '../repositories/payment.repository';

@Injectable()
export class PaymentAccessGuard extends ResourceOwnerGuard {
  protected readonly resourceName = 'Payment';

  constructor (private readonly paymentRepository: PaymentRepository) {
    super();
  }

  protected async isOwnedBy ({ resourceId, userId }: ResourceOwnershipDto): Promise<boolean> {
    const payment = await this.paymentRepository.findById({ id: resourceId });
    return payment?.userId === userId;
  }
}
