import { IPaymentProvider } from '../types/payment-provider.type';
import { ProviderAttempt } from './provider-attempt.interface';

export interface FailoverAttempt<T> {
  candidates: readonly IPaymentProvider[];

  run: (dto: ProviderAttempt) => Promise<T>;
}
