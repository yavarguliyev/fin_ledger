import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

import { BaseConfigLoader } from './base/base-config.loader';
import { SECRETS_CONSTANTS as C } from '../constants/secrets/secrets.constant';
import { ConfigValuesDto, ConfigValuesSchema } from '../dtos/config/config-values.dto';
import { SecretsSettingsDto } from '../dtos/config/secrets-settings.dto';
import { LoaderSettingsDto } from '../dtos/loader/loader-settings.dto';

export class SecretsLoader extends BaseConfigLoader<SecretsSettingsDto> {
  constructor () {
    super({ context: C.LOGGER_CONTEXT, label: C.LABEL, keys: C.KEYS });
  }

  protected settings ({ read, connection }: LoaderSettingsDto): SecretsSettingsDto {
    const secretId = read(C.ID_KEY);
    if (!secretId) throw new Error(C.ERRORS.MISSING_ID);

    return { ...connection, secretId };
  }

  protected async fetch ({ secretId, region, endpoint, accessKeyId, secretAccessKey }: SecretsSettingsDto): Promise<ConfigValuesDto> {
    const client = new SecretsManagerClient({
      region,
      ...(endpoint && { endpoint }),
      ...(accessKeyId && secretAccessKey && { credentials: { accessKeyId, secretAccessKey } })
    });

    try {
      const { SecretString } = await client.send(new GetSecretValueCommand({ SecretId: secretId }));
      if (!SecretString) throw new Error(C.ERRORS.EMPTY_SECRET);

      return ConfigValuesSchema.parse(JSON.parse(SecretString));
    } finally {
      client.destroy();
    }
  }

  protected origin ({ secretId }: SecretsSettingsDto): string {
    return secretId;
  }
}
