import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { FrankfurterFxQuoteProvider } from './providers/frankfurter-fx-quote.provider';
import { FxRateRepository } from './repositories/fx-rate.repository';

@Module({
  imports: [SharedModule],
  providers: [FrankfurterFxQuoteProvider, FxRateRepository],
  exports: [FrankfurterFxQuoteProvider, FxRateRepository]
})
export class FxModule {}
