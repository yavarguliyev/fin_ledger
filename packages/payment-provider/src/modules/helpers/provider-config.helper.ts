import { BadRequestException, Logger } from '@nestjs/common';
import { Environment } from '@common/shared-libs';

import { RequireCredentialsDto } from '../dtos/helper/require-credentials.dto';
import { EnvValueDto } from '../dtos/helper/env-value.dto';
import { ConfigServiceRefDto } from '../dtos/helper/config-service.dto';

export class ProviderConfigHelper {
  static getValue ({ key, configService }: EnvValueDto): string | undefined {
    const value = configService.get<string>(key);
    if (value && value.trim().length > 0) return value.trim();
    return undefined;
  }

  static isSimulationAllowed ({ configService }: ConfigServiceRefDto): boolean {
    const optedIn = configService.get<string>('PAYMENT_SIMULATION') === 'true';
    return optedIn && configService.get<string>('NODE_ENV') !== Environment.Production;
  }

  static requireCredentials ({ configService, keys, providerName, logger }: RequireCredentialsDto): boolean {
    const missing = keys.filter(key => !ProviderConfigHelper.getValue({ key, configService }));
    if (missing.length === 0) return true;

    if (missing.length < keys.length) {
      throw new Error(
        `${providerName} is partially configured; missing: ${missing.join(', ')}. ` +
          'Provide every credential or none - a partly configured provider cannot verify webhooks.'
      );
    }

    if (!ProviderConfigHelper.isSimulationAllowed({ configService })) {
      throw new BadRequestException(
        `${providerName} is missing required configuration: ${missing.join(', ')}. ` +
          'Set PAYMENT_SIMULATION=true outside production to run without a live provider.'
      );
    }

    (logger ?? new Logger(providerName)).warn(`${providerName} is simulated and will NOT move real money.`);
    return false;
  }
}
