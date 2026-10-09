import { GetParametersByPathCommand, Parameter, SSMClient } from '@aws-sdk/client-ssm';

import { BaseConfigLoader } from './base/base-config.loader';
import { PARAMETERS_CONSTANTS as C } from '../constants/parameters/parameters.constant';
import { ConfigValuesDto } from '../dtos/config/config-values.dto';
import { ParametersSettingsDto } from '../dtos/config/parameters-settings.dto';
import { LoaderSettingsDto } from '../dtos/loader/loader-settings.dto';

export class ParametersLoader extends BaseConfigLoader<ParametersSettingsDto> {
  constructor () {
    super({ context: C.LOGGER_CONTEXT, label: C.LABEL, keys: C.KEYS });
  }

  protected settings ({ read, connection }: LoaderSettingsDto): ParametersSettingsDto {
    const path = read(C.PATH_KEY);
    if (!path) throw new Error(C.ERRORS.MISSING_PATH);

    return { ...connection, path };
  }

  protected async fetch ({ path, region, endpoint, accessKeyId, secretAccessKey }: ParametersSettingsDto): Promise<ConfigValuesDto> {
    const client = new SSMClient({
      region,
      ...(endpoint && { endpoint }),
      ...(accessKeyId && secretAccessKey && { credentials: { accessKeyId, secretAccessKey } })
    });
    const parameters: Parameter[] = [];

    try {
      let token: string | undefined;

      do {
        const page = await client.send(new GetParametersByPathCommand({ Path: path, MaxResults: C.PAGE_SIZE, ...(token && { NextToken: token }) }));
        parameters.push(...(page.Parameters ?? []));
        token = page.NextToken;
      } while (token);
    } finally {
      client.destroy();
    }

    return Object.fromEntries(parameters.flatMap(({ Name, Value }) => (Name && Value !== undefined ? [[Name.split(C.PATH_SEPARATOR).pop()!, Value]] : [])));
  }

  protected origin ({ path }: ParametersSettingsDto): string {
    return path;
  }
}
