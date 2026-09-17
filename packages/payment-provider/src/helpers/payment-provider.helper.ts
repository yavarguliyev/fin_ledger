import { InternalServerErrorException } from '@nestjs/common';
import { PaymentIntentCreateParams, PaymentMethod, SetupIntent } from 'stripe';
import { CardBrand, PaymentMethodStatus } from '@common/shared-libs';

import { ProviderMethodResultDto } from '../dtos/provider-method-result.dto';
import { SetupSessionResultDto } from '../dtos/setup-session.dto';

import {
  BuildChargeParamsDto,
  CreateProviderSetupSessionDto,
  GetOrCreateCustomerDto,
  NormalizeBrandDto,
  NotFoundMethodDto,
  ResolveCustomerChargeDto,
  ResolveProviderMethodDto,
  RetrieveSessionMethodDto
} from '../dtos/provider-helper.dto';

export class PaymentProviderHelper {
  static normalizeBrand ({ brand }: NormalizeBrandDto): CardBrand {
    if (!brand) return CardBrand.UNKNOWN;

    const brandMap: Record<string, CardBrand> = {
      visa: CardBrand.VISA,
      mastercard: CardBrand.MASTERCARD,
      master: CardBrand.MASTERCARD,
      amex: CardBrand.AMEX,
      american_express: CardBrand.AMEX,
      'american express': CardBrand.AMEX,
      discover: CardBrand.DISCOVER
    };

    return brandMap[brand.toLowerCase().trim()] ?? CardBrand.UNKNOWN;
  }

  static buildNotFoundResult ({ token, provider }: NotFoundMethodDto): ProviderMethodResultDto {
    return {
      paymentMethodToken: token,
      status: PaymentMethodStatus.REJECTED,
      failureReason: 'Payment method not found at provider',
      rawResponse: { provider, verified: false }
    };
  }

  static async getOrCreateCustomer ({ client, email }: GetOrCreateCustomerDto): Promise<string> {
    if (email) {
      const existing = await client.customers.list({ email, limit: 1 });
      if (existing.data.length > 0 && existing.data[0]?.id) return existing.data[0].id;
      const created = await client.customers.create({ email });
      return created.id;
    }

    const guest = await client.customers.create({ description: 'Wallet Customer' });
    return guest.id;
  }

  static async resolveCustomerForCharge ({ client, dto }: ResolveCustomerChargeDto): Promise<string | undefined> {
    if (!dto.paymentMethodToken) return dto.customerId;

    try {
      const pm = await client.paymentMethods.retrieve(dto.paymentMethodToken);
      if (pm.customer) return typeof pm.customer === 'string' ? pm.customer : pm.customer.id;
      const customerId = await PaymentProviderHelper.getOrCreateCustomer({ client });
      await client.paymentMethods.attach(pm.id, { customer: customerId });
      return customerId;
    } catch {
      return dto.customerId;
    }
  }

  static async createSetupSession ({ client, session }: CreateProviderSetupSessionDto): Promise<SetupSessionResultDto> {
    const customer = await PaymentProviderHelper.getOrCreateCustomer({ client, email: session.customerEmail });
    const checkout = await client.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'setup',
      customer,
      success_url: `${session.returnUrl}?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${session.returnUrl}?status=cancelled`
    });

    return { url: checkout.url ?? '', sessionId: checkout.id };
  }

  static async retrieveSessionMethod ({ client, sessionId }: RetrieveSessionMethodDto): Promise<ProviderMethodResultDto> {
    const session = await client.checkout.sessions.retrieve(sessionId, { expand: ['setup_intent.payment_method'] });
    const setupIntent = session.setup_intent as SetupIntent | null;
    const pm = (setupIntent?.payment_method as PaymentMethod) ?? null;

    if (!pm) throw new InternalServerErrorException('Payment method not found on setup session');

    return {
      paymentMethodToken: pm.id,
      status: PaymentMethodStatus.VERIFIED,
      brand: PaymentProviderHelper.normalizeBrand({ brand: pm.card?.brand }),
      last4: pm.card?.last4 ?? undefined
    };
  }

  static async resolvePaymentMethod ({ client, details, card }: ResolveProviderMethodDto): Promise<PaymentMethod> {
    if (details.token?.startsWith('pm_')) return client.paymentMethods.retrieve(details.token);
    if (details.token?.startsWith('tok_')) return client.paymentMethods.create({ type: 'card', card: { token: details.token } });

    return client.paymentMethods.create({
      type: 'card',
      card: { number: card.number, exp_month: card.expMonth, exp_year: card.expYear, ...(card.cvc ? { cvc: card.cvc } : {}) },
      ...(card.name ? { billing_details: { name: card.name } } : {})
    });
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
}
