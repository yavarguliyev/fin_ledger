import { LoadConfigDto } from '../dtos/loader/load-config.dto';
import { ParametersLoader } from '../loaders/parameters.loader';
import { SecretsLoader } from '../loaders/secrets.loader';

export class AwsConfigHelper {
  static async load (options: LoadConfigDto): Promise<void> {
    await new SecretsLoader().load(options);
    await new ParametersLoader().load(options);
  }
}
