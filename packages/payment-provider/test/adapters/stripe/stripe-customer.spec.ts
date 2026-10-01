import Stripe from 'stripe';

import { StripeMethodHelper } from '../../../src/modules/adapters/stripe/helpers/stripe-method.helper';
import { STRIPE_CUSTOMER_TEST } from '../../constants/stripe-customer.constant';

interface StubCalls {
  listed: number;
  created: number;
  sessionCustomer: string | undefined;
}

const stubClient = (calls: StubCalls): Stripe => {
  const client = {
    customers: {
      list: (): Promise<unknown> => {
        calls.listed += 1;
        return Promise.resolve({ data: [] });
      },
      create: (): Promise<{ id: string }> => {
        calls.created += 1;
        return Promise.resolve({ id: STRIPE_CUSTOMER_TEST.CREATED_CUSTOMER });
      }
    },
    checkout: {
      sessions: {
        create: (params: { customer?: string }): Promise<{ id: string; url: string }> => {
          calls.sessionCustomer = params.customer;
          return Promise.resolve({ id: STRIPE_CUSTOMER_TEST.SESSION_ID, url: STRIPE_CUSTOMER_TEST.SESSION_URL });
        }
      }
    }
  };

  return client as unknown as Stripe;
};

describe('Stripe customer resolution', () => {
  let calls: StubCalls;

  beforeEach(() => {
    calls = { listed: 0, created: 0, sessionCustomer: undefined };
  });

  it('creates a customer without searching by email, because an email search is not unique and can race', async () => {
    const id = await StripeMethodHelper.createCustomer({ client: stubClient(calls), email: STRIPE_CUSTOMER_TEST.EMAIL });

    expect(id).toBe(STRIPE_CUSTOMER_TEST.CREATED_CUSTOMER);
    expect(calls.listed).toBe(0);
    expect(calls.created).toBe(1);
  });

  it('reuses the customer it was given and creates nothing', async () => {
    const session = await StripeMethodHelper.createSetupSession({
      client: stubClient(calls),
      session: { returnUrl: STRIPE_CUSTOMER_TEST.RETURN_URL, customerId: STRIPE_CUSTOMER_TEST.EXISTING_CUSTOMER }
    });

    expect(session.customerId).toBe(STRIPE_CUSTOMER_TEST.EXISTING_CUSTOMER);
    expect(calls.sessionCustomer).toBe(STRIPE_CUSTOMER_TEST.EXISTING_CUSTOMER);
    expect(calls.created).toBe(0);
  });

  it('creates one when it has none, and reports which it used so the caller can store it', async () => {
    const session = await StripeMethodHelper.createSetupSession({
      client: stubClient(calls),
      session: { returnUrl: STRIPE_CUSTOMER_TEST.RETURN_URL, customerEmail: STRIPE_CUSTOMER_TEST.EMAIL }
    });

    expect(session.customerId).toBe(STRIPE_CUSTOMER_TEST.CREATED_CUSTOMER);
    expect(session.sessionId).toBe(STRIPE_CUSTOMER_TEST.SESSION_ID);
    expect(calls.created).toBe(1);
    expect(calls.listed).toBe(0);
  });
});
