import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FxProvider } from '@common/libs';

import { FxQuoteDto } from '../dtos/quote/fx-quote.dto';

@Injectable()
export class FrankfurterFxQuoteProvider {
  constructor (private readonly configService: ConfigService) {}

  private get apiUrl (): string {
    return this.configService.getOrThrow<string>('FX_RATE_API_URL');
  }

  async quote (baseCurrency: string, quoteCurrency: string): Promise<FxQuoteDto> {
    const response = await fetch(`${this.apiUrl}/${baseCurrency}/${quoteCurrency}`);
    if (!response.ok) throw new BadGatewayException('Unable to retrieve the current FX rate');

    const payload: unknown = await response.json();

    const isObject = typeof payload === 'object' && payload !== null;
    const hasRequiredFields = isObject && 'base' in payload && 'quote' in payload && 'rate' in payload;
    const hasValidCurrencies = hasRequiredFields && payload.base === baseCurrency && payload.quote === quoteCurrency;
    const hasValidRate = hasRequiredFields && typeof payload.rate === 'number' && payload.rate > 0;
    const isValidRateResponse = hasValidCurrencies && hasValidRate;

    if (!isValidRateResponse) throw new BadGatewayException('The FX provider returned an invalid rate');

    const quotedAt = new Date();

    return {
      baseCurrency,
      quoteCurrency,
      rate: String(payload.rate),
      provider: FxProvider.Frankfurter,
      expiresAt: new Date(quotedAt.getTime() + 60_000),
      quotedAt
    };
  }
}
