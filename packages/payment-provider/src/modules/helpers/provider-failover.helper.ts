import { Logger } from '@nestjs/common';
import { ProviderError } from '@common/shared-libs';

import { FailoverAttempt } from '../interfaces/failover-attempt.interface';
import { FailoverOutcome } from '../interfaces/failover-outcome.interface';
import { PROVIDER_ROUTING } from '../constants/routing/provider-routing.constant';

export class ProviderFailoverHelper {
  private static readonly logger = new Logger(ProviderFailoverHelper.name);

  static shouldFailOver ({ error }: FailoverOutcome): boolean {
    if (!(error instanceof ProviderError) || error.indeterminate) return false;
    return PROVIDER_ROUTING.FAILOVER_CATEGORIES.includes(error.category);
  }

  static async attempt<T> ({ candidates, run }: FailoverAttempt<T>): Promise<T> {
    let lastError: Error = new Error(PROVIDER_ROUTING.NO_CANDIDATE_MESSAGE);

    for (const provider of candidates) {
      if (!provider.isAvailable()) {
        ProviderFailoverHelper.logger.warn(`Skipping ${provider.providerName}: its circuit is open`);
        lastError = new Error(`${provider.providerName} is unavailable`);
        continue;
      }

      try {
        return await run({ provider });
      } catch (error) {
        if (!ProviderFailoverHelper.shouldFailOver({ error })) throw error;
        const failure = error as ProviderError;
        lastError = failure;
        ProviderFailoverHelper.logger.warn(`${provider.providerName} failed with ${failure.category}; trying the next provider`);
      }
    }

    throw lastError;
  }
}
