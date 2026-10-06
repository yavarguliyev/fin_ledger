import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { Logger } from '@nestjs/common';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { SecretsSource } from '@common/shared-libs';

import { SECRETS_CONSTANTS as C } from '../constants/secrets/secrets.constant';
import { ApplySecretsDto } from '../dtos/apply-secrets.dto';
import { LoadSecretsDto } from '../dtos/load-secrets.dto';
import { SecretsSettingsDto } from '../dtos/secrets-settings.dto';
import { SecretValuesDto, SecretValuesSchema } from '../dtos/secret-values.dto';

export class SecretsLoader {
  private static readonly logger = new Logger(C.LOGGER_CONTEXT);

  static async load (options: LoadSecretsDto): Promise<number> {
    const settings = SecretsLoader.settings(options);
    if (!settings) return 0;

    const values = await SecretsLoader.fetch(settings);
    const applied = SecretsLoader.apply({ env: options.env, values });

    SecretsLoader.logger.log(`Loaded ${applied} of ${Object.keys(values).length} secrets from ${settings.secretId}`);
    return applied;
  }

  private static settings ({ env, envFiles }: LoadSecretsDto): SecretsSettingsDto | null {
    const files = [...envFiles].reverse().filter(path => existsSync(path));
    const file = Object.assign({}, ...files.map(path => parseEnv(readFileSync(path, C.ENV_FILE_ENCODING)))) as NodeJS.Dict<string>;
    const read = (key: string): string | undefined => env[key] ?? file[key];

    if (read(C.KEYS.SOURCE) !== SecretsSource.AWS) return null;

    const secretId = read(C.KEYS.ID);
    if (!secretId) throw new Error(C.ERRORS.MISSING_ID);

    const endpoint = read(C.KEYS.ENDPOINT);
    const accessKeyId = read(C.KEYS.ACCESS_KEY_ID);
    const secretAccessKey = read(C.KEYS.SECRET_ACCESS_KEY);

    return {
      secretId,
      region: read(C.KEYS.REGION) ?? C.DEFAULT_REGION,
      ...(endpoint && { endpoint }),
      ...(accessKeyId && { accessKeyId }),
      ...(secretAccessKey && { secretAccessKey })
    };
  }

  private static async fetch ({ secretId, region, endpoint, accessKeyId, secretAccessKey }: SecretsSettingsDto): Promise<SecretValuesDto> {
    const client = new SecretsManagerClient({
      region,
      ...(endpoint && { endpoint }),
      ...(accessKeyId && secretAccessKey && { credentials: { accessKeyId, secretAccessKey } })
    });

    try {
      const { SecretString } = await client.send(new GetSecretValueCommand({ SecretId: secretId }));
      if (!SecretString) throw new Error(C.ERRORS.EMPTY_SECRET);

      return SecretValuesSchema.parse(JSON.parse(SecretString));
    } finally {
      client.destroy();
    }
  }

  private static apply ({ env, values }: ApplySecretsDto): number {
    const missing = Object.entries(values).filter(([key]) => env[key] === undefined);
    missing.forEach(([key, value]) => (env[key] = value));

    return missing.length;
  }
}
