import type Stripe from 'stripe';

import { StripeClientFakeDto } from '../interfaces/stripe-client-fake.interface';

export const aStripeClient = (client: StripeClientFakeDto): Stripe => client as unknown as Stripe;
