import { GetParametersByPathCommand } from '@aws-sdk/client-ssm';

import { ParametersLoader } from '../../src/modules/loaders/parameters.loader';
import { PARAMETERS_CONSTANTS as C } from '../../src/modules/constants/parameters/parameters.constant';
import { SECRETS_TEST as T } from '../constants/secrets.constant';

const send = jest.fn();

jest.mock('@aws-sdk/client-ssm', () => {
  const actual = jest.requireActual<typeof import('@aws-sdk/client-ssm')>('@aws-sdk/client-ssm');
  return { ...actual, SSMClient: jest.fn(() => ({ send, destroy: jest.fn() })) };
});

const awsEnv = (): NodeJS.ProcessEnv => ({
  [C.KEYS.SOURCE]: T.AWS,
  [C.PATH_KEY]: T.PARAMETERS_PATH,
  [C.KEYS.ENDPOINT]: T.ENDPOINT,
  [C.KEYS.REGION]: T.REGION,
  [C.KEYS.ACCESS_KEY_ID]: T.KEY,
  [C.KEYS.SECRET_ACCESS_KEY]: T.KEY
});

const named = (key: string): string => `${T.PARAMETERS_PATH}${C.PATH_SEPARATOR}${key}`;

describe('ParametersLoader', () => {
  beforeEach(() => {
    send
      .mockReset()
      .mockResolvedValueOnce({ Parameters: [{ Name: named(T.FRONTEND_URL_KEY), Value: T.FRONTEND_URL }], NextToken: T.NEXT_TOKEN })
      .mockResolvedValueOnce({ Parameters: [{ Name: named(T.ORIGINS_KEY), Value: T.ORIGINS }] });
  });

  it('reads every page under the path and names each value after the last path segment', async () => {
    const env = awsEnv();

    await expect(new ParametersLoader().load({ env, envFiles: [T.MISSING_FILE] })).resolves.toBe(2);

    const commands = send.mock.calls.map(([command]: [GetParametersByPathCommand]) => command.input);
    expect(commands[0]).toMatchObject({ Path: T.PARAMETERS_PATH });
    expect(commands[1]).toMatchObject({ NextToken: T.NEXT_TOKEN });
    expect(env).toMatchObject({ [T.FRONTEND_URL_KEY]: T.FRONTEND_URL, [T.ORIGINS_KEY]: T.ORIGINS });
  });

  it('leaves a variable the environment already sets', async () => {
    const env = { ...awsEnv(), [T.FRONTEND_URL_KEY]: T.EXPLICIT_PASSWORD };

    await expect(new ParametersLoader().load({ env, envFiles: [T.MISSING_FILE] })).resolves.toBe(1);
    expect(env[T.FRONTEND_URL_KEY]).toBe(T.EXPLICIT_PASSWORD);
  });

  it('stays off unless the source is aws, and refuses to start without a path', async () => {
    await expect(new ParametersLoader().load({ env: { [C.KEYS.SOURCE]: T.ENV }, envFiles: [T.MISSING_FILE] })).resolves.toBe(0);
    expect(send).not.toHaveBeenCalled();

    await expect(new ParametersLoader().load({ env: { [C.KEYS.SOURCE]: T.AWS }, envFiles: [T.MISSING_FILE] })).rejects.toThrow(C.ERRORS.MISSING_PATH);
  });
});
