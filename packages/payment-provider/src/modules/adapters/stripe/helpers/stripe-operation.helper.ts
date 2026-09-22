import { PaymentIntentCreateParams } from 'stripe';

import { OperationResultDto } from '../../../dtos/adapter/operation-result.dto';
import { BuildChargeParamsDto } from '../../../dtos/helper/build-charge-params.dto';
import { ResolveCustomerChargeDto } from '../../../dtos/helper/resolve-customer-charge.dto';
import { StripeChargeDto } from '../../../dtos/helper/stripe-charge.dto';
import { StripePayoutDto } from '../../../dtos/helper/stripe-payout.dto';
import { StripeRefundDto } from '../../../dtos/helper/stripe-refund.dto';
import { StripeMethodHelper } from './stripe-method.helper';
import { StripeIntentHelper } from './stripe-intent.helper';
import { StripeRetrieveChargeDto } from '../../../dtos/helper/stripe-retrieve-charge.dto';
import { STRIPE_ID_PREFIXES } from '../../../constants/stripe/stripe-id-prefixes.constant';

export class StripeOperationHelper {
  static async resolveCustomerForCharge ({ client, dto }: ResolveCustomerChargeDto): Promise<string | undefined> {
    if (!dto.paymentMethodToken) return dto.customerId;

    const pm = await client.paymentMethods.retrieve(dto.paymentMethodToken);
    if (pm.customer) return typeof pm.customer === 'string' ? pm.customer : pm.customer.id;

    const customerId = await StripeMethodHelper.getOrCreateCustomer({ client });
    await client.paymentMethods.attach(pm.id, { customer: customerId });

    return customerId;
  }

  static buildChargeParams ({ dto, customerId }: BuildChargeParamsDto): PaymentIntentCreateParams {
    return {
      amount: dto.amount,
      currency: dto.currency.toLowerCase(),
      ...(dto.description ? { description: dto.description } : {}),
      ...(customerId ? { customer: customerId } : {}),
      ...(dto.metadata ? { metadata: dto.metadata } : {}),
      ...(dto.paymentMethodToken
        ? { payment_method: dto.paymentMethodToken, confirm: true, payment_method_types: ['card'] }
        : { automatic_payment_methods: { enabled: true, allow_redirects: 'never' as const } })
    };
  }

  static async createCharge ({ client, dto }: StripeChargeDto): Promise<OperationResultDto> {
    const customerId = await StripeOperationHelper.resolveCustomerForCharge({ client, dto });
    const params = StripeOperationHelper.buildChargeParams({ dto, customerId });
    const intent = await client.paymentIntents.create(params, { idempotencyKey: dto.idempotencyKey });

    return StripeIntentHelper.toOperationResult({ intent });
  }

  static async retrieveCharge ({ client, dto }: StripeRetrieveChargeDto): Promise<OperationResultDto> {
    const intentRef = dto.chargeId.startsWith(STRIPE_ID_PREFIXES.CHARGE) ? (await client.charges.retrieve(dto.chargeId)).payment_intent : dto.chargeId;
    const intent = await client.paymentIntents.retrieve(typeof intentRef === 'string' ? intentRef : (intentRef?.id ?? dto.chargeId));

    return { ...StripeIntentHelper.toOperationResult({ intent }), amount: intent.amount, currency: intent.currency };
  }

  static async createPayout ({ client, dto }: StripePayoutDto): Promise<string> {
    const { amount, description, idempotencyKey, recipientToken } = dto;
    const currency = dto.currency.toLowerCase();
    const options = { idempotencyKey };
    const desc = description ? { description } : {};

    const result = recipientToken.startsWith('acct_')
      ? await client.transfers.create({ amount, currency, destination: recipientToken, ...desc }, options)
      : await client.payouts.create({ amount, currency, ...desc }, options);

    return result.id;
  }

  static async createRefund ({ client, dto }: StripeRefundDto): Promise<string> {
    const { amount, chargeId, idempotencyKey } = dto;
    const target = chargeId.startsWith(STRIPE_ID_PREFIXES.PAYMENT_INTENT) ? { payment_intent: chargeId } : { charge: chargeId };
    const refund = await client.refunds.create({ amount, ...target }, { idempotencyKey });

    return refund.id;
  }
}
