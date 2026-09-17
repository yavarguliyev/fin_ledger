import { InternalServerErrorException } from '@nestjs/common';

import { PersistFxRateDto, PersistFxRatePayload } from '../dtos/fx-rate-helper.dto';

export class FxRateHelper {
  public static async persistFxRate (dto: PersistFxRateDto): Promise<PersistFxRatePayload> {
    const { quote, tx, fxRateRepository } = dto;
    const fxRate = await fxRateRepository.createRate(quote, tx);
    if (!fxRate) throw new InternalServerErrorException('Failed to persist FX quote');
    return fxRate;
  }
}
