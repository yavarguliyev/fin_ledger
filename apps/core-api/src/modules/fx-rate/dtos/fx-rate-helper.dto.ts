import { DatabaseAdapter } from '@common/libs';

import { FxRateRepository } from '../repositories/fx-rate.repository';
import { FxQuoteDto, PersistFxRatePayload } from './quote/fx-quote.dto';

export type PersistFxRateDto = {
  quote: FxQuoteDto;
  tx: DatabaseAdapter;
  fxRateRepository: FxRateRepository;
};

export type { PersistFxRatePayload };
