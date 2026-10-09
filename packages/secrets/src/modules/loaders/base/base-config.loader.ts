import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { Logger } from '@nestjs/common';
import { ConfigSource } from '@common/shared-libs';

import { CONFIG_LOADER_CONSTANTS as C } from '../../constants/config/config-loader.constant';
import { AwsConnectionDto } from '../../dtos/config/aws-connection.dto';
import { ConfigKeysDto } from '../../dtos/config/config-keys.dto';
import { ConfigValuesDto } from '../../dtos/config/config-values.dto';
import { ApplyConfigDto } from '../../dtos/loader/apply-config.dto';
import { ConfigLoaderOptionsDto } from '../../dtos/loader/config-loader-options.dto';
import { ConfigReaderDto } from '../../dtos/loader/config-reader.dto';
import { LoadConfigDto } from '../../dtos/loader/load-config.dto';
import { LoaderSettingsDto } from '../../dtos/loader/loader-settings.dto';

export abstract class BaseConfigLoader<TSettings extends AwsConnectionDto> {
  protected readonly logger: Logger;
  private readonly label: string;
  private readonly keys: ConfigKeysDto;

  protected constructor ({ context, label, keys }: ConfigLoaderOptionsDto) {
    this.logger = new Logger(context);
    this.label = label;
    this.keys = keys;
  }

  protected abstract settings (options: LoaderSettingsDto): TSettings;

  protected abstract fetch (settings: TSettings): Promise<ConfigValuesDto>;

  protected abstract origin (settings: TSettings): string;

  async load ({ env, envFiles }: LoadConfigDto): Promise<number> {
    const files = [...envFiles].reverse().filter(path => existsSync(path));
    const file = Object.assign({}, ...files.map(path => parseEnv(readFileSync(path, C.ENV_FILE_ENCODING)))) as NodeJS.Dict<string>;
    const read = (key: string): string | undefined => env[key] ?? file[key];

    if (read(this.keys.SOURCE) !== ConfigSource.AWS) return 0;

    const settings = this.settings({ read, connection: this.connection({ read }) });
    const values = await this.fetch(settings);
    const applied = this.apply({ env, values });

    this.logger.log(`Loaded ${applied} of ${Object.keys(values).length} ${this.label} from ${this.origin(settings)}`);
    return applied;
  }

  private connection ({ read }: ConfigReaderDto): AwsConnectionDto {
    const endpoint = read(this.keys.ENDPOINT);
    const accessKeyId = read(this.keys.ACCESS_KEY_ID);
    const secretAccessKey = read(this.keys.SECRET_ACCESS_KEY);

    return {
      region: read(this.keys.REGION) ?? C.DEFAULT_REGION,
      ...(endpoint && { endpoint }),
      ...(accessKeyId && { accessKeyId }),
      ...(secretAccessKey && { secretAccessKey })
    };
  }

  private apply ({ env, values }: ApplyConfigDto): number {
    const missing = Object.entries(values).filter(([key]) => env[key] === undefined);
    missing.forEach(([key, value]) => (env[key] = value));

    return missing.length;
  }
}
