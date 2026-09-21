import { UnauthorizedException } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentProvider } from '@common/shared-libs';

import { WebhookEventDto } from '../../../dtos/operation/webhook-event.dto';
import { VerifyStripeWebhookDto } from '../../../dtos/helper/verify-stripe-webhook.dto';

export class StripeWebhookHelper {
  static verify ({ client, secret, payload, signature }: VerifyStripeWebhookDto): WebhookEventDto {
    if (!signature) throw new UnauthorizedException('Missing Stripe webhook signature');

    let event: Stripe.Event;

    try {
      event = client.webhooks.constructEvent(payload, signature, secret);
    } catch {
      throw new UnauthorizedException('Invalid Stripe webhook signature');
    }

    return {
      eventId: event.id,
      eventType: event.type,
      provider: PaymentProvider.STRIPE,
      payload: event.data.object as unknown as Record<string, unknown>,
      signature,
      signatureVerified: true
    };
  }
}
