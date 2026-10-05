import { InternalServerErrorException } from '@nestjs/common';
import type Stripe from 'stripe';
import { PaymentMethodStatus, PaymentMethodType } from '@common/shared-libs';

import { ProviderMethodResultDto } from '../../../dtos/operation/provider-method-result.dto';
import { SetupSessionResultDto } from '../../../dtos/operation/setup-session-result.dto';
import { CreateProviderSetupSessionDto } from '../../../dtos/helper/create-provider-setup-session.dto';
import { GetOrCreateCustomerDto } from '../../../dtos/helper/get-or-create-customer.dto';
import { RetrieveSessionMethodDto } from '../../../dtos/helper/retrieve-session-method.dto';
import { StripePaymentMethodDto } from '../../../dtos/helper/stripe-payment-method.dto';
import { ProviderResultHelper } from '../../../helpers/provider-result.helper';
import { STRIPE_CUSTOMER } from '../../../constants/stripe/stripe-customer.constant';

export class StripeMethodHelper {
  static async createCustomer ({ client, email }: GetOrCreateCustomerDto): Promise<string> {
    const created = await client.customers.create(email ? { email } : { description: STRIPE_CUSTOMER.GUEST_DESCRIPTION });
    return created.id;
  }

  static resolveMethodType ({ paymentMethod: pm }: StripePaymentMethodDto): PaymentMethodType {
    if (pm.type !== 'card') return PaymentMethodType.BANK_ACCOUNT;
    return pm.card?.funding === 'debit' ? PaymentMethodType.DEBIT_CARD : PaymentMethodType.CREDIT_CARD;
  }

  static async retrieveSessionMethod ({ client, sessionId }: RetrieveSessionMethodDto): Promise<ProviderMethodResultDto> {
    const session = await client.checkout.sessions.retrieve(sessionId, { expand: ['setup_intent.payment_method'] });
    const setupIntent = session.setup_intent as Stripe.SetupIntent | null;
    const pm = (setupIntent?.payment_method as Stripe.PaymentMethod) ?? null;

    if (!pm) throw new InternalServerErrorException('Payment method not found on setup session');
    return StripeMethodHelper.toMethodResult({ paymentMethod: pm });
  }

  static async createSetupSession ({ client, session }: CreateProviderSetupSessionDto): Promise<SetupSessionResultDto> {
    const customer = session.customerId ?? (await StripeMethodHelper.createCustomer({ client, email: session.customerEmail }));

    const checkout = await client.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'setup',
      customer,
      success_url: `${session.returnUrl}?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${session.returnUrl}?status=cancelled`
    });

    return { url: checkout.url ?? '', sessionId: checkout.id, customerId: customer };
  }

  static toMethodResult ({ paymentMethod: pm }: StripePaymentMethodDto): ProviderMethodResultDto {
    return {
      paymentMethodToken: pm.id,
      status: PaymentMethodStatus.VERIFIED,
      methodType: StripeMethodHelper.resolveMethodType({ paymentMethod: pm }),
      brand: ProviderResultHelper.normalizeBrand({ brand: pm.card?.brand }),
      last4: pm.card?.last4 ?? undefined,
      expMonth: pm.card?.exp_month ?? undefined,
      expYear: pm.card?.exp_year ?? undefined,
      fingerprint: pm.card?.fingerprint ?? undefined,
      billingName: pm.billing_details?.name ?? undefined
    };
  }
}
